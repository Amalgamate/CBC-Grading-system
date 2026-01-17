/**
 * Messages Page
 */

import React, { useState } from 'react';
import { MessageSquare, Plus, Reply, X } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useNotifications } from '../hooks/useNotifications';

const MessagesPage = () => {
  const { showSuccess } = useNotifications();
  const [showCompose, setShowCompose] = useState(false);
  const [messages] = useState([
    { id: 1, subject: 'Learner Progress Discussion', sender: 'Hassan Mohamed', senderRole: 'Parent', date: '2026-01-15', preview: 'I would like to discuss my child\'s progress...', read: false },
    { id: 2, subject: 'Homework Inquiry', sender: 'Mary Wanjiru', senderRole: 'Parent', date: '2026-01-14', preview: 'Could you please clarify the homework...', read: true }
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" subtitle="Parent-teacher communication" icon={MessageSquare}
        actions={<button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={20} /> Compose</button>}
      />

      <div className="bg-white rounded-xl shadow-md divide-y">
        {messages.map(msg => (
          <div key={msg.id} className={`p-6 hover:bg-gray-50 cursor-pointer ${!msg.read ? 'bg-blue-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-800">{msg.subject}</h3>
                  {!msg.read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                </div>
                <p className="text-sm text-gray-600">From: {msg.sender} ({msg.senderRole})</p>
                <p className="text-gray-600 mt-2">{msg.preview}</p>
                <p className="text-xs text-gray-500 mt-2">{msg.date}</p>
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Reply size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Compose Message</h3>
              <button onClick={() => setShowCompose(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Recipient</label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option>Select recipient</option>
                  <option>Hassan Mohamed (Parent)</option>
                  <option>Mary Wanjiru (Parent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Subject</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Enter subject" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea rows="6" className="w-full px-4 py-2 border rounded-lg" placeholder="Type your message..." />
              </div>
              <button onClick={() => {showSuccess('Message sent!'); setShowCompose(false);}} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
