import React, { useState } from 'react';
import {
    ArrowLeft, User, Mail, Phone, Users, MapPin,
    Briefcase, FileText, Printer, Download, GraduationCap, Camera
} from 'lucide-react';
import api from '../../../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import ProfilePhotoModal from '../../shared/ProfilePhotoModal';

const ParentProfile = ({ parent, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { showSuccess, showError } = useNotifications();
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const handleSavePhoto = async (photoData) => {
        try {
            const response = await api.users.uploadPhoto(parent.id, photoData);
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
        { id: 1, name: 'ID_Copy.jpg', date: '2020-03-15', size: '2.1 MB' },
        { id: 2, name: 'Communication_Consent.pdf', date: '2021-01-20', size: '150 KB' },
    ];

    if (!parent) return null;

    const handlePrint = () => {
        window.print();
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'children', label: 'Linked Students', icon: Users },
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
                    <h1 className="text-2xl font-bold text-gray-800">Parent Profile</h1>
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
                    <div className="absolute inset-0 opacity-10 pattern-grid-lg text-brand-purple"></div>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md">
                                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-brand-purple/90 overflow-hidden border border-gray-100">
                                    {(parent.profilePicture || parent.avatar) ? (
                                        <img src={parent.profilePicture || parent.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        parent.name?.substring(0, 2).toUpperCase()
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
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {parent.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2">
                                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-brand-purple text-xs font-bold uppercase tracking-wider border border-purple-100">
                                        {parent.relationship}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={16} />
                                        {parent.county || 'N/A'}
                                    </span>
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
                                    ? 'border-brand-purple text-brand-purple'
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
                        {/* Left Column: Contact & Personal */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                    <User className="text-brand-purple" size={20} />
                                    <h3 className="text-lg font-bold text-gray-800">Contact & Personal Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div>
                                        <label className="premium-label flex items-center gap-2">
                                            <Phone size={14} className="text-gray-400" /> Phone Number
                                        </label>
                                        <p className="text-gray-800 font-medium text-lg">{parent.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" /> Email Address
                                        </label>
                                        <p className="text-gray-800 font-medium">{parent.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label flex items-center gap-2">
                                            <Briefcase size={14} className="text-gray-400" /> Occupation
                                        </label>
                                        <p className="text-gray-800 font-medium">{parent.occupation || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="premium-label flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" /> ID Number
                                        </label>
                                        <p className="text-gray-800 font-medium">{parent.idNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CHILDREN TAB */}
                {activeTab === 'children' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-in">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                            <Users className="text-brand-teal" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Linked Students</h3>
                        </div>

                        {parent.learnerIds && parent.learnerIds.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parent.learnerIds.map((id, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-full border border-gray-200 text-brand-purple">
                                            <GraduationCap size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">Student ID: {id}</p>
                                            <p className="text-sm text-gray-500">Linked Profile</p>
                                        </div>
                                        {/* Ideally, we'd fetch and display Name/Grade here */}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                <Users size={48} className="mb-4 text-gray-200" />
                                <p className="text-gray-500 italic">No students linked yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Attached Documents</h3>
                            <button className="text-sm text-brand-purple font-medium hover:underline">
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
                                    <button className="p-2 text-gray-400 hover:text-brand-purple transition">
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
                currentPhoto={parent.profilePicture || parent.avatar}
            />
        </div>
    );
};

export default ParentProfile;
