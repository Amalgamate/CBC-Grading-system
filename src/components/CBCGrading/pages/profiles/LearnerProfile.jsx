import React, { useState, useEffect } from 'react';
import {
    User, Calendar, MapPin, Users, Heart,
    GraduationCap, Receipt, FileText, Activity,
    Download, AlertCircle, Camera, Plus
} from 'lucide-react';
import api from '../../../../services/api';
import StatusBadge from '../../shared/StatusBadge';
import ProfileHeader from '../../shared/ProfileHeader';
import ProfileLayout from '../../shared/ProfileLayout';
import { useNotifications } from '../../hooks/useNotifications';
import ProfilePhotoModal from '../../shared/ProfilePhotoModal';

const LearnerProfile = ({ learner: initialLearner, onBack, brandingSettings, onNavigate }) => {
    const { showSuccess, showError } = useNotifications();
    const [currentLearner, setCurrentLearner] = useState(initialLearner);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    useEffect(() => {
        if (initialLearner && initialLearner.id !== currentLearner?.id) {
            setCurrentLearner(initialLearner);
        }
    }, [initialLearner]);

    useEffect(() => {
        const fetchLearnerDetails = async () => {
            if (initialLearner?.id) {
                try {
                    const response = await api.learners.getById(initialLearner.id);
                    if (response.success || response.data) {
                        setCurrentLearner(response.data || response);
                    }
                } catch (error) {
                    console.error('Failed to fetch latest learner details:', error);
                }
            }
        };
        fetchLearnerDetails();
    }, [initialLearner?.id]);

    useEffect(() => {
        if (currentLearner?.id) {
            fetchTabData('academic');
            fetchTabData('financials');
            if (activeTab !== 'overview' && activeTab !== 'academic' && activeTab !== 'financials') {
                fetchTabData(activeTab);
            }
        }
    }, [activeTab, currentLearner?.id]);

    const fetchTabData = async (targetTab = activeTab) => {
        if (!currentLearner?.id) return;
        setLoading(true);
        try {
            if (targetTab === 'financials') {
                const response = await api.fees.getLearnerInvoices(currentLearner.id);
                const data = response.data || response;
                setInvoices(Array.isArray(data) ? data : []);
            } else if (targetTab === 'academic') {
                const data = await api.assessments.getSummativeByLearner(currentLearner.id);
                setAssessments(data || []);
            }
        } catch (error) {
            console.error('Error fetching tab data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePhoto = async (photoData) => {
        try {
            const learnerId = currentLearner?.id || initialLearner?.id;
            const response = await api.learners.uploadPhoto(learnerId, photoData);
            if (response.success) {
                showSuccess('Profile photo updated successfully');
                setCurrentLearner(prev => ({
                    ...prev,
                    photoUrl: response.data?.photoUrl || photoData,
                    photo: response.data?.photoUrl || photoData,
                    avatar: response.data?.photoUrl || photoData
                }));
            }
        } catch (error) {
            console.error('Failed to upload photo:', error);
            showError('Failed to update profile photo');
        }
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const feeBalance = invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'financials', label: 'Financials', icon: Receipt },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'medical', label: 'Medical', icon: Heart },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    if (!currentLearner) return null;

    return (
        <ProfileLayout
            title="Student Profile"
            onBack={onBack}
            primaryAction={{
                label: "Edit Profile",
                icon: FileText,
                onClick: () => onNavigate('learners-admissions', { learner: currentLearner })
            }}
        >
            <ProfileHeader
                name={`${currentLearner.firstName} ${currentLearner.middleName || ''} ${currentLearner.lastName}`}
                avatar={currentLearner.photoUrl || currentLearner.photo || currentLearner.avatar}
                avatarFallback={`${currentLearner.firstName?.[0]}${currentLearner.lastName?.[0]}`}
                status={currentLearner.status}
                bannerColor="brand-purple"
                badges={[
                    { text: currentLearner.admissionNumber || currentLearner.admNo, icon: GraduationCap, className: "bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-md" },
                    { text: `${currentLearner.grade} ${currentLearner.stream || ''}`, className: "font-medium text-gray-700" }
                ]}
                quickStats={[
                    { label: "Age", value: `${calculateAge(currentLearner.dateOfBirth)} years` },
                    {
                        label: "Fee Balance",
                        value: `KES ${feeBalance.toLocaleString()}`,
                        className: feeBalance > 0 ? 'text-red-500' : 'text-emerald-600'
                    }
                ]}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onPhotoClick={() => setShowPhotoModal(true)}
            />

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                            <User className="text-brand-purple" size={20} />
                                            <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                            <div>
                                                <label className="premium-label">Date of Birth</label>
                                                <p className="text-gray-800 font-medium">
                                                    {currentLearner.dateOfBirth ? new Date(currentLearner.dateOfBirth).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Gender</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.gender}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Nationality</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.nationality || 'Kenyan'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Religion</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.religion || 'Christian'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                            <Calendar className="text-brand-teal" size={20} />
                                            <h3 className="text-lg font-bold text-gray-800">Academic & Admission</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                            <div>
                                                <label className="premium-label">Admission Number</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.admissionNumber || currentLearner.admNo}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Date of Admission</label>
                                                <p className="text-gray-800 font-medium">
                                                    {currentLearner.dateOfAdmission ? new Date(currentLearner.dateOfAdmission).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Current Grade</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.grade}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Current Stream</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.stream}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                            <Users className="text-blue-500" size={20} />
                                            <h3 className="text-lg font-bold text-gray-800">Guardian Info</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="premium-label">Name</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.guardianName || currentLearner.guardian1Name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Phone</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.guardianPhone || currentLearner.guardian1Phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Email</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.guardianEmail || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                            <MapPin className="text-orange-500" size={20} />
                                            <h3 className="text-lg font-bold text-gray-800">Location</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="premium-label">County</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.county || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Residential Address</label>
                                                <p className="text-gray-800 font-medium">{currentLearner.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FINANCIALS TAB */}
                        {activeTab === 'financials' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">Fee Statement</h3>
                                                <p className="text-sm text-gray-500">Recent invoices and payments</p>
                                            </div>
                                            {onNavigate && feeBalance > 0 && (
                                                <button
                                                    onClick={() => onNavigate('fees-collection', { learnerId: currentLearner.id })}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm text-xs font-bold uppercase tracking-wider"
                                                >
                                                    <Plus size={14} />
                                                    Record Payment
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 mb-1">Total Outstanding</p>
                                            <p className="text-3xl font-bold text-brand-purple">
                                                KES {feeBalance.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {invoices.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-gray-600">
                                                <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-500">
                                                    <tr>
                                                        <th className="px-6 py-4">Invoice #</th>
                                                        <th className="px-6 py-4">Date</th>
                                                        <th className="px-6 py-4">Description</th>
                                                        <th className="px-6 py-4 text-right">Amount</th>
                                                        <th className="px-6 py-4 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {invoices.map((inv) => (
                                                        <tr key={inv.id} className="hover:bg-gray-50/50 text-xs">
                                                            <td className="px-6 py-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                                                            <td className="px-6 py-4">
                                                                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-gray-800">{inv.feeStructure?.name || 'Academic Fee'}</p>
                                                                <p className="text-[10px] opacity-60 uppercase">{inv.feeStructure?.term?.replace('_', ' ')} • {inv.feeStructure?.academicYear}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="font-black text-gray-900">KES {Number(inv.totalAmount || inv.amount).toLocaleString()}</div>
                                                                <div className="text-[10px] text-red-500 font-bold">Bal: {Number(inv.balance).toLocaleString()}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {inv.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                            <Receipt size={48} className="mb-4 text-gray-200" />
                                            <p>No financial records found for this student.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ACADEMIC TAB */}
                        {activeTab === 'academic' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Assessments</h3>
                                    {assessments.length > 0 ? (
                                        <div className="space-y-4">
                                            {assessments.map((assessment, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-purple/30 transition">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-white rounded-lg border border-gray-200 text-brand-purple">
                                                            <Activity size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800">{assessment.test?.name || 'Assessment'}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                {assessment.test?.subject} • {assessment.test?.term} • {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-gray-900">{assessment.score}%</p>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase">{assessment.grade}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                            <GraduationCap size={48} className="mb-4 text-gray-200" />
                                            <p>No assessment records found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MEDICAL TAB */}
                        {activeTab === 'medical' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                        <Heart className="text-red-500" size={20} />
                                        <h3 className="text-lg font-bold text-gray-800">Medical Conditions</h3>
                                    </div>
                                    {currentLearner.medicalConditions ? (
                                        <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-900">
                                            {currentLearner.medicalConditions}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                                            <AlertCircle size={32} className="mb-2 text-gray-200" />
                                            <p>No known medical conditions.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                        <AlertCircle className="text-orange-500" size={20} />
                                        <h3 className="text-lg font-bold text-gray-800">Allergies</h3>
                                    </div>
                                    {currentLearner.allergies ? (
                                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 text-orange-900">
                                            {currentLearner.allergies}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                                            <AlertCircle size={32} className="mb-2 text-gray-200" />
                                            <p>No known allergies.</p>
                                        </div>
                                    )}
                                </div>
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
                                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                    <FileText size={48} className="mb-4 text-gray-200" />
                                    <p className="font-medium">No documents uploaded yet</p>
                                    <p className="text-sm mt-1">Upload student documents to view them here</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ProfilePhotoModal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                onSave={handleSavePhoto}
                currentPhoto={currentLearner.photoUrl || currentLearner.photo || currentLearner.avatar}
            />
        </ProfileLayout>
    );
};

export default LearnerProfile;
