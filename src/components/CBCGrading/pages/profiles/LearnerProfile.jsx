import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, User, Calendar, MapPin, Users, Heart,
    GraduationCap, Clock, Receipt, FileText, Activity,
    Download, Printer, File, AlertCircle, Camera, Plus
} from 'lucide-react';
import api from '../../../../services/api';
import StatusBadge from '../../shared/StatusBadge';
import { useNotifications } from '../../hooks/useNotifications';
import ProfilePhotoModal from '../../shared/ProfilePhotoModal';
import { generatePDFWithLetterhead } from '../../../../utils/simplePdfGenerator';
import TermlyReportTemplate from '../../templates/TermlyReportTemplate';
import IndividualTestTemplate from '../../templates/IndividualTestTemplate';
import PDFPreviewModal from '../../shared/PDFPreviewModal';

const LearnerProfile = ({ learner, onBack, brandingSettings, onNavigate }) => {
    const { showSuccess, showError } = useNotifications();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [exportReportData, setExportReportData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showReportTypeModal, setShowReportTypeModal] = useState(false);
    const [selectedReportType, setSelectedReportType] = useState('TERMLY');
    const [selectedIndividualTest, setSelectedIndividualTest] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const handleSavePhoto = async (photoData) => {
        try {
            const response = await api.learners.uploadPhoto(learner.id, photoData);
            if (response.success) {
                showSuccess('Profile photo updated successfully');
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to upload photo:', error);
            showError('Failed to update profile photo');
        }
    };

    // Mock Documents Data
    const documents = [
        { id: 1, name: 'Admission Form.pdf', date: '2025-01-10', size: '2.4 MB' },
        { id: 2, name: 'Medical Consent.pdf', date: '2025-01-12', size: '1.1 MB' },
        { id: 3, name: 'Term 1 Report Card.pdf', date: '2025-04-05', size: '850 KB' },
        { id: 4, name: 'Birth Certificate.jpg', date: '2025-01-10', size: '3.2 MB' },
    ];

    useEffect(() => {
        if (learner?.id) {
            // Pre-load data for the overview and report generator
            fetchTabData('academic');
            fetchTabData('financials');

            if (activeTab !== 'overview' && activeTab !== 'academic' && activeTab !== 'financials') {
                fetchTabData(activeTab);
            }
        }
    }, [activeTab, learner?.id]);

    const fetchTabData = async (targetTab = activeTab) => {
        setLoading(true);
        try {
            if (targetTab === 'financials') {
                // Fetch invoices and identify balance
                const response = await api.fees.getLearnerInvoices(learner.id);
                const data = response.data || response;
                setInvoices(Array.isArray(data) ? data : []);
            } else if (targetTab === 'academic') {
                // Fetch recent assessments
                const data = await api.assessments.getSummativeByLearner(learner.id);
                setAssessments(data || []);
            }
        } catch (error) {
            console.error('Error fetching tab data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleGenerateReport = async (onProgress) => {
        try {
            if (onProgress) onProgress('Gathering assessment records...', 10);

            let data = null;
            let filename = '';

            if (selectedReportType === 'TERMLY') {
                const response = await api.reports.getTermlyReport(learner.id, {
                    term: 'TERM_1', // Should be dynamic in a full implementation
                    academicYear: 2025
                });

                if (response.success) {
                    data = response.data;
                    filename = `${learner.firstName}_${learner.lastName}_Term1_Report.pdf`;
                }
            } else if (selectedIndividualTest) {
                // assessments state already has the data from fetchTabData
                data = selectedIndividualTest;
                filename = `${learner.firstName}_${learner.lastName}_${selectedIndividualTest.test?.title.replace(/\s+/g, '_')}_Result.pdf`;
            }

            if (data) {
                setExportReportData({
                    ...data,
                    schoolName: brandingSettings?.schoolName || 'Amalgamate Academy',
                    logoUrl: brandingSettings?.logoUrl || '/logo-educore.png',
                    brandColor: brandingSettings?.brandColor || '#4a0404',
                    schoolAddress: brandingSettings?.address || 'Nairobi, Kenya',
                    schoolPhone: brandingSettings?.phone || '+254 700 000000',
                    schoolEmail: brandingSettings?.email || 'info@amalgamate.co.ke',
                    schoolSlogan: brandingSettings?.welcomeMessage || 'Excellence in Knowledge and Character'
                });
                if (onProgress) onProgress('Preparing premium layout...', 40);

                // Small delay to ensure render
                await new Promise(resolve => setTimeout(resolve, 500));

                const schoolInfo = {
                    schoolName: brandingSettings?.schoolName || 'Amalgamate Academy',
                    address: brandingSettings?.address || 'Nairobi, Kenya',
                    phone: brandingSettings?.phone || '+254 700 000000',
                    email: brandingSettings?.email || 'info@amalgamate.co.ke',
                    logoUrl: brandingSettings?.logoUrl || '/logo-educore.png',
                    brandColor: brandingSettings?.brandColor || '#4a0404'
                };

                const result = await generatePDFWithLetterhead(
                    'export-report-content',
                    filename,
                    { ...schoolInfo, skipLetterhead: true },
                    {
                        onProgress,
                        scale: 2,
                        useCORS: true,
                        allowTaint: true
                    }
                );

                if (result.success) {
                    showSuccess('Professional report downloaded successfully!');
                    return { success: true };
                } else {
                    showError('Generation failed. Please try again.');
                    return { success: false, error: result.error };
                }
            } else {
                showError('Could not retrieve report data');
                return { success: false, error: 'No data' };
            }
        } catch (error) {
            console.error('Report generation error:', error);
            showError('An error occurred during report generation');
            return { success: false, error: error.message };
        } finally {
            setIsGenerating(false);
        }
    };

    const triggerReportSelection = () => {
        setShowReportTypeModal(true);
    };

    const handleSelectTestReport = (testResult) => {
        setSelectedReportType('INDIVIDUAL');
        setSelectedIndividualTest(testResult);
        setShowReportTypeModal(false);
        setShowPreviewModal(true);
    };

    const handleSelectTermlyReport = () => {
        setSelectedReportType('TERMLY');
        setSelectedIndividualTest(null);
        setShowReportTypeModal(false);
        setShowPreviewModal(true);
    };

    if (!learner) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'financials', label: 'Financials', icon: Receipt },
        { id: 'academic', label: 'Academic', icon: GraduationCap },
        { id: 'medical', label: 'Medical', icon: Heart },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header with Back Button and Actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 no-print"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
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
                {/* Clean Flat Header Background */}
                <div className="h-32 bg-gray-50 border-b border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pattern-grid-lg text-brand-purple"></div>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md">
                                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden border border-gray-100">
                                    {learner.photoUrl || learner.photo || learner.avatar ? (
                                        <img src={learner.photoUrl || learner.photo || learner.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-gray-300" />
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
                                    {learner.firstName} {learner.middleName} {learner.lastName}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2">
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-sm font-medium">
                                        <GraduationCap size={14} />
                                        {learner.admissionNumber || learner.admNo}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="font-medium text-gray-700">{learner.grade} {learner.stream}</span>
                                    <span className="text-gray-300">•</span>
                                    <StatusBadge status={learner.status} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Age</p>
                            <p className="text-lg font-bold text-gray-900">{calculateAge(learner.dateOfBirth)} years</p>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Attendance</p>
                            <p className="text-lg font-bold text-green-600">98%</p>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Performance</p>
                            <p className="text-lg font-bold text-blue-600">B+ (Avg)</p>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fee Balance</p>
                            <p className={`text-lg font-bold ${invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0) > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                KES {invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="px-8 border-t border-gray-100 no-print flex overflow-x-auto hide-scrollbar">
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
                                                <p className="text-gray-800 font-medium">{formatDate(learner.dateOfBirth)}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Gender</label>
                                                <p className="text-gray-800 font-medium">{learner.gender}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Nationality</label>
                                                <p className="text-gray-800 font-medium">{learner.nationality || 'Kenyan'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Religion</label>
                                                <p className="text-gray-800 font-medium">{learner.religion || 'Christian'}</p>
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
                                                <p className="text-gray-800 font-medium">{learner.admissionNumber || learner.admNo}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Date of Admission</label>
                                                <p className="text-gray-800 font-medium">{formatDate(learner.dateOfAdmission)}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Current Grade</label>
                                                <p className="text-gray-800 font-medium">{learner.grade}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Current Stream</label>
                                                <p className="text-gray-800 font-medium">{learner.stream}</p>
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
                                                <p className="text-gray-800 font-medium">{learner.guardianName || learner.guardian1Name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Phone</label>
                                                <p className="text-gray-800 font-medium">{learner.guardianPhone || learner.guardian1Phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Email</label>
                                                <p className="text-gray-800 font-medium">{learner.guardianEmail || 'N/A'}</p>
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
                                                <p className="text-gray-800 font-medium">{learner.county || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="premium-label">Residential Address</label>
                                                <p className="text-gray-800 font-medium">{learner.address || 'N/A'}</p>
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
                                            {onNavigate && invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0) > 0 && (
                                                <button
                                                    onClick={() => onNavigate('fees-collection', { learnerId: learner.id })}
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
                                                KES {invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0).toLocaleString()}
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
                                                            <td className="px-6 py-4">{formatDate(inv.createdAt)}</td>
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
                                <div className="flex justify-end">
                                    <button
                                        onClick={triggerReportSelection}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition shadow-sm font-medium"
                                    >
                                        <Printer size={18} />
                                        Print Report Card
                                    </button>
                                </div>

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
                                                                {assessment.test?.subject} • {assessment.test?.term} • {formatDate(assessment.createdAt)}
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
                                    {learner.medicalConditions ? (
                                        <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-900">
                                            {learner.medicalConditions}
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
                                    {learner.allergies ? (
                                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 text-orange-900">
                                            {learner.allergies}
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
                    </>
                )}
            </div>
            {/* Profile Photo Modal */}
            <ProfilePhotoModal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                onSave={handleSavePhoto}
                currentPhoto={learner.photoUrl || learner.photo || learner.avatar}
            />
            {/* Hidden Export Container for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden', height: 0, width: 0 }}>
                {exportReportData && (
                    <div className="w-[800px] bg-white">
                        {selectedReportType === 'TERMLY' ? (
                            <TermlyReportTemplate
                                reportData={exportReportData}
                                id="export-report-content"
                            />
                        ) : (
                            <IndividualTestTemplate
                                testData={exportReportData}
                                learner={learner}
                                id="export-report-content"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Report Type Selection Modal */}
            {showReportTypeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Print Assessment Report</h3>
                            <p className="text-gray-500 mb-8 font-medium">Select the type of professional report you wish to generate for {learner.firstName}.</p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleSelectTermlyReport}
                                    className="w-full flex items-center justify-between p-6 bg-brand-purple/5 border-2 border-brand-purple/20 rounded-xl hover:bg-brand-purple/10 transition group text-left"
                                >
                                    <div>
                                        <span className="block text-lg font-black text-brand-purple uppercase tracking-tight">Comprehensive Termly Report</span>
                                        <span className="text-sm font-bold text-gray-500">Summary of all subjects, attendance, and teacher comments.</span>
                                    </div>
                                    <FileText className="text-brand-purple group-hover:scale-110 transition shrink-0" size={32} />
                                </button>

                                <div className="pt-4 pb-2">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Individual Test Statements</span>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {(assessments || []).length > 0 ? (
                                        assessments.map((res, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectTestReport(res)}
                                                className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-brand-teal/5 transition group"
                                            >
                                                <div className="text-left">
                                                    <span className="block font-black text-gray-800 uppercase text-xs tracking-tight">{res.test?.title}</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{res.test?.learningArea} • {res.percentage}% Score</span>
                                                </div>
                                                <Printer className="text-gray-400 group-hover:text-brand-teal transition" size={18} />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center bg-gray-50 rounded-lg italic text-gray-400 text-sm font-medium">
                                            No individual tests found. Click "Academic" tab to load data if needed.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowReportTypeModal(false)}
                                className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* High-Fidelity Preview Modal */}
            <PDFPreviewModal
                show={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                onGenerate={handleGenerateReport}
                contentElementId="export-report-content"
                title={`${selectedReportType === 'TERMLY' ? 'Termly Progress Report' : 'Individual Test Result'}`}
            />
        </div>
    );
};

export default LearnerProfile;
