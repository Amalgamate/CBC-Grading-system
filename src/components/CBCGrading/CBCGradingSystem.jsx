/**
 * CBCGradingSystem
 * Main component using extracted modules
 */

import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import Toast from './shared/Toast';
import ConfirmDialog from './shared/ConfirmDialog';
import EmptyState from './shared/EmptyState';
import AddEditParentModal from './shared/AddEditParentModal';
import AddEditTeacherModal from './shared/AddEditTeacherModal';

// Hooks
import { useLearners } from './hooks/useLearners';
import { useTeachers } from './hooks/useTeachers';
import { useParents } from './hooks/useParents';
import { useNotifications } from './hooks/useNotifications';
import { API_BASE_URL } from '../../services/api';

// Utils
import { PAGE_TITLES } from './utils/constants';
import { clearAllSchoolData } from '../../utils/schoolDataCleanup';

// Lazy load page components for better performance
const RoleDashboard = lazy(() => import('./pages/dashboard/RoleDashboard'));
const LearnersList = lazy(() => import('./pages/LearnersList'));
const TeachersList = lazy(() => import('./pages/TeachersList'));
const ParentsList = lazy(() => import('./pages/ParentsList'));
const LearningHubPage = lazy(() => import('./pages/LearningHubPage'));
const PromotionPage = lazy(() => import('./pages/PromotionPage'));
const TransferOutPage = lazy(() => import('./pages/TransferOutPage'));
const DailyAttendance = lazy(() => import('./pages/DailyAttendanceAPI'));
const AttendanceReports = lazy(() => import('./pages/AttendanceReports'));
const AdmissionsPage = lazy(() => import('./pages/AdmissionsPage'));
const TransfersInPage = lazy(() => import('./pages/TransfersInPage'));
const ExitedLearnersPage = lazy(() => import('./pages/ExitedLearnersPage'));
const FormativeAssessment = lazy(() => import('./pages/FormativeAssessment'));
const FormativeReport = lazy(() => import('./pages/FormativeReport'));
const SummativeTests = lazy(() => import('./pages/SummativeTests'));
const SummativeAssessment = lazy(() => import('./pages/SummativeAssessment'));
const SummativeReport = lazy(() => import('./pages/SummativeReport'));
const TermlyReport = lazy(() => import('./pages/TermlyReport'));
const SummaryReportPage = lazy(() => import('./pages/reports/SummaryReportPage'));
const PerformanceScale = lazy(() => import('./pages/PerformanceScale'));
const NoticesPage = lazy(() => import('./pages/NoticesPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SupportHub = lazy(() => import('./pages/SupportHub'));
const TimetablePage = lazy(() => import('./pages/TimetablePage'));
const CodingPlayground = lazy(() => import('./pages/CodingPlayground'));
const SchoolSettings = lazy(() => import('./pages/settings/SchoolSettings'));
const AcademicSettings = lazy(() => import('./pages/settings/AcademicSettings'));
const UserManagement = lazy(() => import('./pages/settings/UserManagement'));
const BrandingSettings = lazy(() => import('./pages/settings/BrandingSettings'));
const BackupSettings = lazy(() => import('./pages/settings/BackupSettings'));
const CommunicationSettings = lazy(() => import('./pages/settings/CommunicationSettings'));
const PaymentSettings = lazy(() => import('./pages/settings/PaymentSettings'));
const FeeCollectionPage = lazy(() => import('./pages/FeeCollectionPage'));
const FeeStructurePage = lazy(() => import('./pages/FeeStructurePage'));
const FeeReportsPage = lazy(() => import('./pages/FeeReportsPage'));
const StudentStatementsPage = lazy(() => import('./pages/StudentStatementsPage'));
const DocumentCenter = lazy(() => import('./pages/DocumentCenter'));
const LearnerProfile = lazy(() => import('./pages/profiles/LearnerProfile'));
const TeacherProfile = lazy(() => import('./pages/profiles/TeacherProfile'));
const ParentProfile = lazy(() => import('./pages/profiles/ParentProfile'));


// Premium Loading Component for Lazy Transitions
const LoadingOverlay = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm animate-in fade-in duration-500">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-[#0D9488]/20 border-t-[#0D9488] rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-[#0D9488]/10 rounded-full animate-pulse"></div>
      </div>
    </div>
    <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse tracking-wide uppercase">
      Optimizing Experience...
    </p>
  </div>
);

export default function CBCGradingSystem({ user, onLogout, brandingSettings, setBrandingSettings }) {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageParams, setPageParams] = useState({});

  // Initialize from localStorage or default to 'dashboard'
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      return localStorage.getItem('cbc_current_page') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  // Initialize from localStorage or default
  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('cbc_expanded_sections');
      return saved ? JSON.parse(saved) : {
        dashboard: true,
        learners: false,
        teachers: false,
        attendance: false,
        communications: false,
        assessment: false,
        'learning-hub': false,
        settings: false
      };
    } catch (e) {
      return {
        dashboard: true,
        learners: false,
        teachers: false,
        attendance: false,
        communications: false,
        assessment: false,
        'learning-hub': false,
        settings: false
      };
    }
  });

  // Persist currentPage changes
  React.useEffect(() => {
    try {
      localStorage.setItem('cbc_current_page', currentPage);
    } catch (e) {
      console.error('Failed to save page state', e);
    }
  }, [currentPage]);

  React.useEffect(() => {
    const schoolId = (user && (user.school?.id || user.schoolId)) || localStorage.getItem('currentSchoolId');
    const lastSchoolId = localStorage.getItem('cbc_last_school_id');
    if (!schoolId) return;
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const onEnterNewSchool = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'X-School-Id': schoolId,
          },
        });
        const json = await res.json();
        const school = json?.data || json;
        const branches = Array.isArray(school?.branches) ? school.branches : [];
        const learnersCount = (school?._count && school._count.learners) || 0;
        const isBlank = (branches.length === 0) && learnersCount === 0;
        if (isBlank) {
          setCurrentPage('settings-school');
          setExpandedSections(prev => ({ ...prev, settings: true }));
          try {
            localStorage.setItem('cbc_current_page', 'settings-school');
          } catch { }
        }
      } catch { }
    };
    // Redirect to settings if switching to a different or fresh school
    if (lastSchoolId !== schoolId) {
      localStorage.setItem('cbc_last_school_id', schoolId);
      onEnterNewSchool();
    }
  }, [user]);

  // Persist expandedSections changes
  React.useEffect(() => {
    try {
      localStorage.setItem('cbc_expanded_sections', JSON.stringify(expandedSections));
    } catch (e) {
      console.error('Failed to save sidebar state', e);
    }
  }, [expandedSections]);

  // Confirmation Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Parent Modal State
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  // Teacher Modal State
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Learner Modal State - VIEW MODAL REMOVED
  const [editingLearner, setEditingLearner] = useState(null);

  // Custom Hooks
  const {
    learners,
    pagination,
    createLearner,
    updateLearner,
    deleteLearner,
    bulkDeleteLearners,
    fetchLearners,
    loading: learnersLoading,
  } = useLearners();

  const {
    teachers,
    setSelectedTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    archiveTeacher,
  } = useTeachers();

  const {
    parents,
    pagination: parentPagination,
    fetchParents,
    setSelectedParent,
    createParent,
    updateParent,
    archiveParent,
    deleteParent,
  } = useParents();

  const {
    showToast,
    toastMessage,
    toastType,
    showSuccess,
    hideNotification
  } = useNotifications();

  // Handlers
  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const isOpening = !prev[section];
      if (isOpening) {
        // Close all other sections
        const newState = Object.keys(prev).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {});
        newState[section] = true;
        return newState;
      } else {
        // Just toggling off
        return { ...prev, [section]: false };
      }
    });
  };

  const handleNavigate = (page, params = {}) => {
    setPageParams(params);
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setConfirmAction(() => () => {
      setShowConfirmDialog(false);

      // Clear all school-specific data from localStorage
      const result = clearAllSchoolData();
      console.log('Logout cleanup:', result);

      onLogout();
    });
    setShowConfirmDialog(true);
  };

  const handleAddLearner = () => {
    setEditingLearner(null);
    setCurrentPage('learners-admissions');
  };

  const handleEditLearner = (learner) => {
    setEditingLearner(learner);
    setCurrentPage('learners-admissions');
  };

  const handleViewLearner = (learner) => {
    handleNavigate('learner-profile', { learner });
  };

  const handleSaveLearner = async (learnerData) => {
    if (editingLearner) {
      const result = await updateLearner(editingLearner.id, learnerData);
      if (result.success) {
        showSuccess('Student updated successfully!');
        setEditingLearner(null);
      } else {
        showSuccess('Error updating student: ' + result.error);
      }
    } else {
      const result = await createLearner(learnerData);
      if (result.success) {
        showSuccess('Student added successfully!');
      } else {
        showSuccess('Error creating student: ' + result.error);
      }
    }
  };

  const handleMarkAsExited = (learnerId) => {
    setConfirmAction(() => () => {
      // Update learner status to Exited
      const learner = learners.find(l => l.id === learnerId);
      if (learner) {
        updateLearner({ ...learner, status: 'Exited' });
        showSuccess('Learner marked as exited successfully');
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleDeleteLearner = async (learnerId) => {
    setConfirmAction(() => async () => {
      const result = await deleteLearner(learnerId);
      if (result.success) {
        showSuccess('Student deleted successfully');
      } else {
        showSuccess('Error deleting student: ' + result.error);
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleBulkDeleteLearners = React.useCallback(async (learnerIds) => {
    const result = await bulkDeleteLearners(learnerIds);
    if (result.success) {
      const count = learnerIds.length;
      showSuccess(`${count} student${count !== 1 ? 's' : ''} deleted successfully`);
    } else {
      showSuccess(result.error || 'Error deleting students');
    }
  }, [bulkDeleteLearners, showSuccess]);

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowTeacherModal(true);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = async (teacherData) => {
    if (editingTeacher) {
      const result = await updateTeacher(editingTeacher.id, teacherData);
      if (result.success) {
        showSuccess('Tutor updated successfully!');
        setShowTeacherModal(false);
        setEditingTeacher(null);
      } else {
        showSuccess('Error updating tutor: ' + result.error);
      }
    } else {
      const result = await createTeacher(teacherData);
      if (result.success) {
        showSuccess('Tutor added successfully!');
        setShowTeacherModal(false);
      } else {
        showSuccess('Error creating tutor: ' + result.error);
      }
    }
  };

  const handleViewTeacher = (teacher) => {
    handleNavigate('teacher-profile', { teacher });
  };

  const handleDeleteTeacher = async (teacherId) => {
    setConfirmAction(() => async () => {
      const isSuperAdmin = user?.role === 'SUPER_ADMIN';
      const result = isSuperAdmin
        ? await deleteTeacher(teacherId)
        : await archiveTeacher(teacherId);

      if (result.success) {
        showSuccess(isSuperAdmin ? 'Tutor deleted successfully' : 'Tutor archived successfully');
      } else {
        showSuccess('Error: ' + result.error);
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // Parent handlers
  const handleAddParent = () => {
    setEditingParent(null);
    setShowParentModal(true);
  };

  const handleEditParent = (parent) => {
    setEditingParent(parent);
    setShowParentModal(true);
  };

  const handleViewParent = (parent) => {
    handleNavigate('parent-profile', { parent });
  };

  const handleSaveParent = async (parentData) => {
    if (editingParent) {
      const result = await updateParent(editingParent.id, parentData);
      if (result.success) {
        showSuccess('Parent updated successfully!');
        setShowParentModal(false);
        setEditingParent(null);
      } else {
        showSuccess('Error updating parent: ' + result.error);
      }
    } else {
      const result = await createParent(parentData);
      if (result.success) {
        showSuccess('Parent added successfully!');
        setShowParentModal(false);
      } else {
        showSuccess('Error creating parent: ' + result.error);
      }
    }
  };

  const handleDeleteParent = async (parentId) => {
    setConfirmAction(() => async () => {
      const result = await deleteParent(parentId);
      if (result.success) {
        showSuccess('Parent deleted successfully');
      } else {
        showSuccess('Error deleting parent: ' + result.error);
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleArchiveParent = async (parentId) => {
    setConfirmAction(() => async () => {
      const result = await archiveParent(parentId);
      if (result.success) {
        showSuccess('Parent archived successfully');
      } else {
        showSuccess('Error archiving parent: ' + result.error);
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // Render Current Page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <RoleDashboard learners={learners} pagination={pagination} teachers={teachers} user={user} onNavigate={handleNavigate} />;

      // Learners Module
      case 'learners-list':
        return (
          <LearnersList
            learners={learners}
            loading={learnersLoading}
            pagination={pagination}
            onFetchLearners={fetchLearners}
            onAddLearner={handleAddLearner}
            onEditLearner={handleEditLearner}
            onViewLearner={handleViewLearner}
            onMarkAsExited={handleMarkAsExited}
            onDeleteLearner={handleDeleteLearner}
            onBulkDelete={handleBulkDeleteLearners}
            onRefresh={fetchLearners}
          />
        );
      case 'learners-admissions':
        return (
          <AdmissionsPage
            onSave={handleSaveLearner}
            onCancel={() => {
              setCurrentPage('learners-list');
              setEditingLearner(null);
            }}
            learner={editingLearner}
          />
        );
      case 'learners-transfers-in':
        return <TransfersInPage />;
      case 'learners-exited':
        return <ExitedLearnersPage />;
      case 'learners-promotion':
        return <PromotionPage learners={learners} />;
      case 'learners-transfer-out':
        return <TransferOutPage learners={learners} />;
      case 'learner-profile':
        return (
          <LearnerProfile
            learner={pageParams.learner}
            onBack={() => handleNavigate('learners-list')}
            brandingSettings={brandingSettings}
            onNavigate={handleNavigate}
          />
        );

      // Teachers Module
      case 'teachers-list':
        return (
          <TeachersList
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onEditTeacher={handleEditTeacher}
            onViewTeacher={handleViewTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        );
      case 'teacher-profile':
        return (
          <TeacherProfile
            teacher={pageParams.teacher}
            onBack={() => handleNavigate('teachers-list')}
          />
        );

      // Parents Module
      case 'parents-list':
        return (
          <ParentsList
            parents={parents}
            pagination={parentPagination}
            onFetchParents={fetchParents}
            onAddParent={handleAddParent}
            onEditParent={handleEditParent}
            onViewParent={handleViewParent}
            onDeleteParent={handleDeleteParent}
            onArchiveParent={handleArchiveParent}
          />
        );
      case 'parent-profile':
        return (
          <ParentProfile
            parent={pageParams.parent}
            onBack={() => handleNavigate('parents-list')}
          />
        );

      // Timetable Module
      case 'timetable':
        return <TimetablePage />;
      case 'coding-playground':
        return <CodingPlayground />;

      // Attendance Module
      case 'attendance-daily':
        return <DailyAttendance learners={learners} />;
      case 'attendance-reports':
        return <AttendanceReports learners={learners} />;

      // Assessment Module
      case 'assess-formative':
        return <FormativeAssessment learners={learners} />;
      case 'assess-formative-report':
        return <FormativeReport learners={learners} />;
      case 'assess-summative-tests':
        return <SummativeTests onNavigate={handleNavigate} />;
      case 'assess-summative-assessment':
        return <SummativeAssessment learners={learners} initialTestId={pageParams.initialTestId} />;
      case 'assess-summative-report':
        return <SummativeReport learners={learners} onFetchLearners={fetchLearners} brandingSettings={brandingSettings} user={user} />;
      case 'assess-summary-report':
        return <SummaryReportPage />;
      case 'assess-termly-report':
        return <TermlyReport learners={learners} brandingSettings={brandingSettings} />;
      case 'assess-performance-scale':
        return <PerformanceScale />;

      // Learning Hub Module (Placeholder)
      case 'learning-hub-materials':
      case 'learning-hub-assignments':
      case 'learning-hub-lesson-plans':
      case 'learning-hub-library':
        return <LearningHubPage />;

      // Communications Module
      case 'comm-notices':
        return <NoticesPage />;
      case 'comm-messages':
        return <MessagesPage />;

      // Documents Module
      case 'documents-center':
        return <DocumentCenter />;

      // Fee Management Module
      case 'fees-structure':
        return <FeeStructurePage />;
      case 'fees-collection':
        return <FeeCollectionPage learnerId={pageParams.learnerId} />;
      case 'fees-reports':
        return <FeeReportsPage />;
      case 'fees-statements':
        return <StudentStatementsPage />;

      // Help Module
      case 'help':
        return <SupportHub />;

      // Settings Module
      case 'settings-school':
        return <SchoolSettings brandingSettings={brandingSettings} setBrandingSettings={setBrandingSettings} />;
      case 'settings-academic':
        return <AcademicSettings />;
      case 'settings-users':
        return <UserManagement />;
      case 'settings-branding':
        return <BrandingSettings brandingSettings={brandingSettings} setBrandingSettings={setBrandingSettings} />;
      case 'settings-backup':
        return <BackupSettings />;
      case 'settings-communication':
        return <CommunicationSettings />;
      case 'settings-payment':
        return <PaymentSettings />;

      default:
        return (
          <EmptyState
            title={PAGE_TITLES[currentPage] || 'Page'}
            message="This page is under development and will be available soon."
            actionText="Return to Dashboard"
            onAction={() => setCurrentPage('dashboard')}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        brandingSettings={brandingSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          brandingSettings={brandingSettings}
          title={PAGE_TITLES[currentPage]}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-screen-2xl mx-auto">
            <Suspense fallback={<LoadingOverlay />}>
              {renderPage()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={hideNotification}
      />

      {/* Add/Edit Parent Modal */}
      <AddEditParentModal
        show={showParentModal}
        onClose={() => {
          setShowParentModal(false);
          setEditingParent(null);
        }}
        onSave={handleSaveParent}
        parent={editingParent}
        learners={learners}
      />

      {/* Add/Edit Teacher Modal */}
      <AddEditTeacherModal
        show={showTeacherModal}
        onClose={() => {
          setShowTeacherModal(false);
          setEditingTeacher(null);
        }}
        onSave={handleSaveTeacher}
        teacher={editingTeacher}
      />




      {/* Confirmation Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        title="Confirm Action"
        message={
          currentPage === 'dashboard' && confirmAction
            ? "Are you sure you want to logout?"
            : "Are you sure you want to proceed with this action?"
        }
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={() => confirmAction && confirmAction()}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  );
}
