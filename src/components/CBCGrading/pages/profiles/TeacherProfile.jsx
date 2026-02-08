import React, { useState } from 'react';
import {
    ArrowLeft, User, Mail, Phone, BookOpen, GraduationCap,
    MapPin, Calendar, Briefcase, FileText, Printer, Download, Camera
} from 'lucide-react';
import StatusBadge from '../../shared/StatusBadge';
import api from '../../../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import ProfilePhotoModal from '../../shared/ProfilePhotoModal';

const TeacherProfile = ({ teacher, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { showSuccess, showError } = useNotifications();
    const [showPhotoModal, setShowPhotoModal] = useState(false);

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

    // Mock Documents
    const documents = [
        { id: 1, name: 'Employment Contract.pdf', date: '2018-05-12', size: '1.2 MB' },
        { id: 2, name: 'TSC Certificate.pdf', date: '2015-08-20', size: '2.5 MB' },
        { id: 3, name: 'JD_Senior_Teacher.docx', date: '2023-01-10', size: '450 KB' },
    ];

    if (!teacher) return null;

    const handlePrint = () => {
        window.print();
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'classes', label: 'Classes & Subjects', icon: BookOpen },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 no-print"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Tutor Profile</h1>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm no-print"
                >
                    <Printer size={18} />
                    Print Profile
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="h-32 bg-gray-50 border-b border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pattern-grid-lg text-brand-teal"></div>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md">
                                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden border border-gray-100">
                                    {teacher.profilePicture || teacher.avatar || (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-brand-teal text-3xl font-bold">
                                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                                        </div>
                                    )}
                                    {(teacher.profilePicture || teacher.avatar) && (
                                        <img src={teacher.profilePicture || teacher.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    className="absolute bottom-0 right-0 p-1.5 bg-brand-teal text-white rounded-full shadow-md hover:bg-brand-teal/90 transition transform hover:scale-105 z-10"
                                    title="Update Photo"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div className="mb-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {teacher.firstName} {teacher.lastName}
                                    </h2>
                                    <StatusBadge status={teacher.status} />
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2">
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-sm font-medium">
                                        <Briefcase size={14} />
                                        {teacher.role || 'Teacher'}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1">
                                        <BookOpen size={16} />
                                        {teacher.subject}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="font-medium text-gray-700">{teacher.employeeNo}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex gap-3 no-print">
                            <button className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition shadow-sm font-medium">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-t border-gray-100 flex overflow-x-auto hide-scrollbar pt-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-brand-teal text-brand-teal'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal & Employment Info */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                    <User className="text-brand-teal" size={20} />
                                    <h3 className="text-lg font-bold text-gray-800">Personal & Employment Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div>
                                        <label className="premium-label">Gender</label>
                                        <p className="text-gray-800 font-medium">{teacher.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label">Employee Number</label>
                                        <p className="text-gray-800 font-medium">{teacher.employeeNo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label">TSC Number</label>
                                        <p className="text-gray-800 font-medium">{teacher.tscNo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label">ID Number</label>
                                        <p className="text-gray-800 font-medium">{teacher.idNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label">Primary Subject</label>
                                        <p className="text-gray-800 font-medium">{teacher.subject || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label">Date of Employment</label>
                                        <p className="text-gray-800 font-medium">
                                            {teacher.dateOfEmployment ? new Date(teacher.dateOfEmployment).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                    <Phone className="text-blue-500" size={20} />
                                    <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="premium-label flex items-center gap-2">
                                            <Phone size={14} className="text-gray-400" /> Phone
                                        </label>
                                        <p className="text-gray-800 font-medium">{teacher.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" /> Email
                                        </label>
                                        <p className="text-gray-800 font-medium">{teacher.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" /> Address
                                        </label>
                                        <p className="text-gray-800 font-medium">{teacher.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-in">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                            <BookOpen className="text-brand-purple" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Assigned Classes & Subjects</h3>
                        </div>
                        {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {teacher.assignedClasses.map((cls, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-md border border-gray-200 text-brand-purple">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{cls}</p>
                                            <p className="text-xs text-gray-500 truncate">{teacher.subject}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                <BookOpen size={48} className="mb-4 text-gray-200" />
                                <p className="text-gray-500 italic">No classes assigned yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Attached Documents</h3>
                            <button className="text-sm text-brand-teal font-medium hover:underline">
                                Upload New
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{doc.name}</p>
                                            <p className="text-xs text-gray-500">{doc.size} • {doc.date}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-brand-teal transition">
                                        <Download size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Profile Photo Modal */}
            <ProfilePhotoModal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                onSave={handleSavePhoto}
                currentPhoto={teacher.profilePicture || teacher.avatar}
            />
        </div>
    );
};

export default TeacherProfile;
