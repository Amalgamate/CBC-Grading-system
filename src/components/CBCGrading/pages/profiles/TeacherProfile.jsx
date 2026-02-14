import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, BookOpen, GraduationCap,
    MapPin, FileText, Printer, Download,
    MessageCircle, Send, Share2, RefreshCcw, Package,
    Plus, LogOut, Key, Briefcase
} from 'lucide-react';
import IssueItemModal from '../../shared/IssueItemModal';
import ProfileHeader from '../../shared/ProfileHeader';
import ProfileLayout from '../../shared/ProfileLayout';
import api from '../../../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import ProfilePhotoModal from '../../shared/ProfilePhotoModal';
import ResetPasswordModal from '../../shared/ResetPasswordModal';

const TeacherProfile = ({ teacher, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { showSuccess, showError } = useNotifications();
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [assignedBooks, setAssignedBooks] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);

    useEffect(() => {
        if (teacher?.id) {
            fetchBooks();
        }
    }, [teacher?.id]);

    const fetchBooks = async () => {
        setLoadingBooks(true);
        try {
            const resp = await api.books.getAll({ assignedToId: teacher.id });
            if (resp.success) {
                setAssignedBooks(resp.data);
            }
            const availableResp = await api.books.getAll({ status: 'AVAILABLE' });
            if (availableResp.success) {
                setAvailableBooks(availableResp.data);
            }
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setLoadingBooks(false);
        }
    };

    const handleIssueBook = async (bookId) => {
        try {
            const resp = await api.books.assign(bookId, teacher.id);
            if (resp.success) {
                showSuccess(resp.message || 'Item issued successfully');
                fetchBooks();
                setShowIssueModal(false);
            }
        } catch (error) {
            showError('Failed to issue item');
        }
    };

    const handleReturnBook = async (bookId) => {
        if (!window.confirm('Are you sure the teacher has returned this item?')) return;
        try {
            const resp = await api.books.return(bookId);
            if (resp.success) {
                showSuccess('Item returned successfully');
                fetchBooks();
            }
        } catch (error) {
            showError('Failed to return item');
        }
    };

    const handleSavePhoto = async (photoData) => {
        try {
            const response = await api.users.uploadPhoto(teacher.id, photoData);
            if (response.success) {
                showSuccess('Profile photo updated successfully');
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to upload photo:', error);
            showError('Failed to update profile photo');
        }
    };

    const handleShareDocument = async (doc) => {
        if (!teacher.phone) {
            showError("Teacher has no phone number");
            return;
        }
        try {
            const msg = `Hello ${teacher.firstName}, I'm sharing this document with you: ${doc.name}. Download here: ${doc.url || '#'}`;
            const whatsappUrl = `https://wa.me/${teacher.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
            window.open(whatsappUrl, '_blank');
            showSuccess('Opening WhatsApp...');
        } catch (err) {
            showError('Failed to share document');
        }
    };

    const documents = [
        { id: 1, name: 'Employment Contract.pdf', date: '2018-05-12', size: '1.2 MB', url: '#' },
        { id: 2, name: 'TSC Certificate.pdf', date: '2015-08-20', size: '2.5 MB', url: '#' },
        { id: 3, name: 'JD_Senior_Teacher.docx', date: '2023-01-10', size: '450 KB', url: '#' },
    ];

    if (!teacher) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'classes', label: 'Classes & Subjects', icon: BookOpen },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <ProfileLayout
            title="Tutor Profile"
            onBack={onBack}
            onPrint={() => window.print()}
            secondaryAction={{
                label: "Reset Password",
                icon: Key,
                onClick: () => setShowResetModal(true),
                className: "text-purple-600 hover:bg-purple-50"
            }}
            primaryAction={{
                label: "Edit Profile",
                onClick: () => console.log('Edit Profile')
            }}
        >
            <ProfileHeader
                name={`${teacher.firstName} ${teacher.lastName}`}
                avatar={teacher.profilePicture || teacher.avatar}
                avatarFallback={`${teacher.firstName?.[0]}${teacher.lastName?.[0]}`}
                status={teacher.status}
                bannerColor="brand-teal"
                badges={[
                    { text: teacher.role?.replace(/_/g, ' ') || 'Teacher', icon: Briefcase, className: "bg-brand-teal/5 text-brand-teal px-2.5 py-1 rounded-full border border-brand-teal/10 font-bold text-xs" },
                    { text: teacher.assignedClasses?.length > 0 ? teacher.assignedClasses.join(', ') : 'No Classes', icon: BookOpen },
                    { text: `ID: ${teacher.staffId || teacher.employeeNo || 'N/A'}`, className: "text-gray-400 font-bold" }
                ]}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onPhotoClick={() => setShowPhotoModal(true)}
            />

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal & Employment Info */}
                            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center text-brand-teal">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Personal & Employment Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                                        <p className="text-gray-900 font-bold">{teacher.gender || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Number</label>
                                        <p className="text-gray-900 font-bold">{teacher.employeeNo || teacher.staffId || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TSC Number</label>
                                        <p className="text-gray-900 font-bold">{teacher.tscNo || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Number</label>
                                        <p className="text-gray-900 font-bold">{teacher.idNumber || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Subject</label>
                                        <p className="text-gray-900 font-bold">{teacher.subject || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Employment</label>
                                        <p className="text-gray-900 font-bold">
                                            {teacher.dateOfEmployment ? new Date(teacher.dateOfEmployment).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Phone size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Contact Information</h3>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-900 font-bold text-lg">{teacher.phone || 'N/A'}</p>
                                            {teacher.phone && (
                                                <div className="flex gap-2">
                                                    <a
                                                        href={`https://wa.me/${teacher.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition shadow-sm"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </a>
                                                    <a
                                                        href={`sms:${teacher.phone}`}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm"
                                                        title="Send SMS"
                                                    >
                                                        <Send size={18} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-900 font-bold truncate max-w-[200px]">{teacher.email || 'N/A'}</p>
                                            {teacher.email && (
                                                <a
                                                    href={`mailto:${teacher.email}`}
                                                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                                >
                                                    <Mail size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Residential Address</label>
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="text-gray-400 mt-0.5" />
                                            <p className="text-gray-700 font-medium leading-relaxed">{teacher.address || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                        <BookOpen size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Academic Workload</h3>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <button
                                        onClick={() => setShowIssueModal(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-teal/10 text-brand-teal rounded-lg hover:bg-brand-teal/20 transition text-xs font-bold ring-1 ring-brand-teal/20"
                                    >
                                        <Plus size={14} />
                                        Issue Item/Book
                                    </button>
                                    <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold ring-1 ring-purple-100">
                                        {teacher.assignedClasses?.length || 0} Classes Assigned
                                    </span>
                                </div>
                            </div>

                            {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {teacher.assignedClasses.map((cls, idx) => (
                                        <div key={idx} className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-teal/20 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors">
                                                        <GraduationCap size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-lg">{cls}</p>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{teacher.subject}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Assignments</span>
                                                    <span className="text-[10px] font-bold text-brand-teal px-2 py-0.5 bg-brand-teal/5 rounded">Books</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {loadingBooks ? (
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
                                                            <RefreshCcw size={14} className="animate-spin" />
                                                            Checking for assigned books...
                                                        </div>
                                                    ) : assignedBooks.length > 0 ? (
                                                        assignedBooks.map(book => (
                                                            <div key={book.id} className="flex items-center justify-between group/item p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                                    <Package size={14} className="text-emerald-500" />
                                                                    {book.title}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleReturnBook(book.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                                    title="Return Item"
                                                                >
                                                                    <LogOut size={14} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic py-1 pl-1">No items currently assigned.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <BookOpen size={32} className="text-gray-300" />
                                    </div>
                                    <h4 className="text-gray-900 font-bold mb-1">No Classes Found</h4>
                                    <p className="text-gray-500 text-sm">Assign this teacher to classes in the <span className="text-brand-teal font-bold cursor-pointer">Class Management</span> section.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center text-brand-teal">
                                    <FileText size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Professional Documents</h3>
                            </div>
                            <button className="px-4 py-2 bg-white border border-gray-200 text-brand-teal rounded-lg font-bold text-sm hover:bg-gray-50 transition shadow-sm">
                                Upload New
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <div key={doc.id} className="group p-6 flex items-center justify-between hover:bg-brand-teal/[0.02] transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                <FileText size={22} />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 tracking-tight">{doc.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">{doc.size}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs text-gray-500 font-medium">Uploaded on {new Date(doc.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleShareDocument(doc)}
                                                className="p-2.5 bg-brand-teal/10 text-brand-teal rounded-xl hover:bg-brand-teal/20 transition shadow-sm"
                                                title="Share via WhatsApp"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                            <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition shadow-sm" title="Download">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center">
                                    <FileText size={48} className="text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">No documents attached to this profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ProfilePhotoModal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                onSave={handleSavePhoto}
                currentPhoto={teacher.profilePicture || teacher.avatar}
            />

            <ResetPasswordModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                user={teacher}
                onResetSuccess={(msg) => showSuccess(msg)}
            />

            <IssueItemModal
                isOpen={showIssueModal}
                onClose={() => setShowIssueModal(false)}
                items={availableBooks}
                onIssue={handleIssueBook}
                teacherName={`${teacher.firstName} ${teacher.lastName}`}
            />
        </ProfileLayout>
    );
};

export default TeacherProfile;
