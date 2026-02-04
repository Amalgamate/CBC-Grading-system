
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Plus, ChevronLeft, Loader2 } from 'lucide-react';
import { useSocket } from '../../../contexts/SocketContext';
import { supportAPI } from '../../../services/supportApi';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const SupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'create', 'chat'
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');

    // Create Form State
    const [subject, setSubject] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [initialMessage, setInitialMessage] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');

    const { isAuthenticated } = useAuth();

    // Check if we are on landing page (or unauthenticated context)
    const isGuest = !isAuthenticated;

    const { socket } = useSocket();
    const messagesEndRef = useRef(null);

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeTicket?.messages]);

    // Fetch tickets when opening (only if authenticated)
    useEffect(() => {
        if (isOpen && !isGuest) {
            fetchTickets();
        } else if (isOpen && isGuest) {
            // For guest, we default to create view immediately
            setView('create');
        }
    }, [isOpen, isGuest]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            if (activeTicket && msg.ticketId === activeTicket.id) {
                setActiveTicket(prev => ({
                    ...prev,
                    messages: [...prev.messages, msg]
                }));
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, activeTicket]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await supportAPI.getTickets();
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!subject || !initialMessage) return;

        try {
            setLoading(true);
            const data = { subject, priority: isGuest ? 'MEDIUM' : priority, message: initialMessage };

            if (isGuest) {
                if (!guestName || !guestEmail) {
                    toast.error("Please provide your name and email");
                    return;
                }
                data.guestName = guestName;
                data.guestEmail = guestEmail;
            }

            const newTicket = await supportAPI.createTicket(data);

            if (isGuest) {
                toast.success('Your message has been sent! We will contact you via email.');
                setIsOpen(false);
                setSubject('');
                setInitialMessage('');
                setGuestName('');
                setGuestEmail('');
                return;
            }

            setTickets([newTicket, ...tickets]);
            openChat(newTicket.id);
            // Reset form
            setSubject('');
            setPriority('MEDIUM');
            setInitialMessage('');
            toast.success('Ticket created successfully');
        } catch (error) {
            toast.error('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const openChat = async (ticketId) => {
        try {
            setLoading(true);
            const ticket = await supportAPI.getTicket(ticketId);
            setActiveTicket(ticket);
            setView('chat');
            if (socket) {
                socket.emit('join_ticket', ticketId);
            }
        } catch (error) {
            toast.error('Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTicket) return;

        try {
            await supportAPI.addMessage(activeTicket.id, newMessage);
            // Note: Socket might pick this up too if we emit to self, but safer to append locally immediately for responsiveness
            // If socket also receives it, we might duplicate. Usually best to wait for socket OR check ID.
            // For simplicity, we'll append and rely on React key deduping or just assume socket is for OTHERS.
            // Actually, our backend emits to room. If we are in room, we receive it. 
            // To avoid duplication, check if message ID exists? Or simpler: don't append manually, wait for socket? 
            // Waiting for socket might feel slow.
            // Let's append manually and filter duplicates if needed.

            // Optimistic UI handled by socket in this case if it's fast enough.
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const leaveChat = () => {
        if (socket && activeTicket) {
            socket.emit('leave_ticket', activeTicket.id);
        }
        setActiveTicket(null);
        setView('list');
        fetchTickets(); // Refresh list to update counts/status
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50 hover:scale-110 active:scale-95 group"
            >
                {/* Ping animation wrapper */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping group-hover:animate-none"></span>
                <MessageCircle size={32} className="relative z-10" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    {view !== 'list' && !isGuest && (
                        <button onClick={view === 'chat' ? leaveChat : () => setView('list')} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <h3 className="font-semibold text-lg">{isGuest ? 'Contact Support' : 'Support Details'}</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">

                {/* LIST VIEW */}
                {view === 'list' && (
                    <div className="p-4 space-y-3">
                        <button
                            onClick={() => setView('create')}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Plus size={20} /> Start New Conversation
                        </button>

                        {loading && tickets.length === 0 ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <div className="space-y-2 mt-4">
                                {tickets.length === 0 ? (
                                    <p className="text-center text-slate-500 mt-8">No tickets found.</p>
                                ) : (
                                    tickets.map(ticket => (
                                        <div key={ticket.id} onClick={() => openChat(ticket.id)} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                                    ticket.status === 'RESOLVED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate">{ticket.subject}</h4>
                                            <p className="text-sm text-slate-500 truncate mt-1">
                                                {ticket._count?.messages || 0} messages
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* CREATE VIEW */}
                {view === 'create' && (
                    <form onSubmit={handleCreateTicket} className="p-4 space-y-4">
                        {isGuest && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={e => setGuestName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 outline-none"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={e => setGuestEmail(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 outline-none"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 outline-none"
                                placeholder="Briefly describe the issue..."
                                required
                            />
                        </div>

                        {!isGuest && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                <select
                                    value={priority}
                                    onChange={e => setPriority(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 outline-none"
                                >
                                    <option value="LOW">Low - General Inquiry</option>
                                    <option value="MEDIUM">Medium - Setup Issue</option>
                                    <option value="HIGH">High - System Error</option>
                                    <option value="CRITICAL">Critical - System Down</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                            <textarea
                                value={initialMessage}
                                onChange={e => setInitialMessage(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 outline-none min-h-[120px]"
                                placeholder="How can we help you?"
                                required
                            />
                        </div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isGuest ? 'SendMessage' : 'Submit Ticket')}
                        </button>
                    </form>
                )}

                {/* CHAT VIEW */}
                {view === 'chat' && activeTicket && (
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeTicket.messages?.map((msg) => {
                                const isMe = msg.senderId === JSON.parse(localStorage.getItem('user') || '{}').id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                                            }`}>
                                            <p className="text-sm">{msg.message}</p>
                                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type a message..."
                            />
                            <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div >
    );
};

export default SupportWidget;
