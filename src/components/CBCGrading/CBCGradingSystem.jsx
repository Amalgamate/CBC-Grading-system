/**
 * CBCGradingSystem - REFACTORED VERSION
 * Main component using extracted modules
 */

import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import Dashboard from './pages/Dashboard';
import LearnersList from './pages/LearnersList';
import TeachersList from './pages/TeachersList';
import ParentsList from './pages/ParentsList';
import PromotionPage from './pages/PromotionPage';
import TransferOutPage from './pages/TransferOutPage';
import DailyAttendance from './pages/DailyAttendance';
import AttendanceReports from './pages/AttendanceReports';
import AdmissionsPage from './pages/AdmissionsPage';
import TransfersInPage from './pages/TransfersInPage';
import ExitedLearnersPage from './pages/ExitedLearnersPage';
import FormativeAssessment from './pages/FormativeAssessment';
import FormativeReport from './pages/FormativeReport';
import SummativeTests from './pages/SummativeTests';
import SummativeAssessment from './pages/SummativeAssessment';
import SummativeReport from './pages/SummativeReport';
import TermlyReport from './pages/TermlyReport';
import PerformanceScale from './pages/PerformanceScale';
import NoticesPage from './pages/NoticesPage';
import MessagesPage from './pages/MessagesPage';
import HelpPage from './pages/HelpPage';
import SchoolSettings from './pages/settings/SchoolSettings';
import AcademicSettings from './pages/settings/AcademicSettings';
import UserManagement from './pages/settings/UserManagement';
import BrandingSettings from './pages/settings/BrandingSettings';
import BackupSettings from './pages/settings/BackupSettings';
import Toast from './shared/Toast';
import ConfirmDialog from './shared/ConfirmDialog';
import EmptyState from './shared/EmptyState';
import AddEditParentModal from './shared/AddEditParentModal';

// Hooks
import { useLearners } from './hooks/useLearners';
import { useTeachers } from './hooks/useTeachers';
import { useNotifications } from './hooks/useNotifications';

// Utils
import { PAGE_TITLES } from './utils/constants';

// Sample initial data
const initialLearners = [
  { 
    id: 1, firstName: 'Amina', middleName: 'Wanjiku', lastName: 'Hassan', 
    admNo: 'ADM001', grade: 'Grade 3', stream: 'A', status: 'Active', 
    phone: '+254712345678', avatar: '👧', dob: '2015-05-12', gender: 'Female',
    guardian1Name: 'Hassan Mohamed', guardian1Phone: '+254701234567',
    guardian1Email: 'hassan.m@email.com', guardian1Relationship: 'Father'
  },
  { 
    id: 2, firstName: 'Jamal', middleName: 'Kariuki', lastName: 'Kipchoge',
    admNo: 'ADM002', grade: 'Grade 3', stream: 'A', status: 'Active',
    phone: '+254712345679', avatar: '👦', dob: '2015-03-22', gender: 'Male',
    guardian1Name: 'Samuel Kipchoge', guardian1Phone: '+254702234567',
    guardian1Email: 'samuel.k@email.com', guardian1Relationship: 'Father'
  },
  { 
    id: 3, firstName: 'Zara', middleName: 'Akinyi', lastName: 'Mwangi',
    admNo: 'ADM003', grade: 'Grade 3', stream: 'B', status: 'Active',
    phone: '+254712345680', avatar: '👧', dob: '2015-07-08', gender: 'Female',
    guardian1Name: 'John Mwangi', guardian1Phone: '+254703234567',
    guardian1Email: 'john.mwangi@email.com', guardian1Relationship: 'Father'
  }
];

const initialTeachers = [
  {
    id: 1, firstName: 'Grace', lastName: 'Wanjiru', employeeNo: 'TCH001',
    email: 'grace.wanjiru@zawadijrn.ac.ke', phone: '+254710234567',
    gender: 'Female', tscNumber: 'TSC/234567', status: 'Active',
    role: 'Class Teacher', subject: 'English', experience: '12 years',
    avatar: '👩‍🏫', qualifications: 'B.Ed (Arts)'
  },
  {
    id: 2, firstName: 'David', lastName: 'Omondi', employeeNo: 'TCH002',
    email: 'david.omondi@zawadijrn.ac.ke', phone: '+254711234567',
    gender: 'Male', tscNumber: 'TSC/345678', status: 'Active',
    role: 'Head of Department', subject: 'Mathematics', experience: '15 years',
    avatar: '👨‍🏫', qualifications: 'M.Ed (Mathematics)'
  }
];

export default function CBCGradingSystem({ user, onLogout, brandingSettings, setBrandingSettings }) {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState({ 
    dashboard: true,
    learners: false,
    teachers: false,
    attendance: false,
    communications: false,
    assessment: false,
    settings: false
  });

  // Confirmation Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Parent Modal State
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [parents, setParents] = useState([]);

  // Custom Hooks
  const {
    learners,
    selectedLearner,
    setSelectedLearner,
    addLearner,
    updateLearner,
    deleteLearner
  } = useLearners(initialLearners);

  const {
    teachers,
    selectedTeacher,
    setSelectedTeacher,
    addTeacher,
    updateTeacher,
    deleteTeacher
  } = useTeachers(initialTeachers);

  const {
    showToast,
    toastMessage,
    toastType,
    showSuccess,
    showError,
    hideNotification
  } = useNotifications();

  // Handlers
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    setConfirmAction(() => () => {
      setShowConfirmDialog(false);
      onLogout();
    });
    setShowConfirmDialog(true);
  };

  const handleAddLearner = () => {
    setCurrentPage('learners-admissions');
  };

  const handleEditLearner = (learner) => {
    setSelectedLearner(learner);
    showSuccess('Edit learner feature coming soon!');
  };

  const handleViewLearner = (learner) => {
    setSelectedLearner(learner);
    showSuccess('View learner feature coming soon!');
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

  const handleDeleteLearner = (learnerId) => {
    setConfirmAction(() => () => {
      deleteLearner(learnerId);
      setShowConfirmDialog(false);
      showSuccess('Learner deleted successfully');
    });
    setShowConfirmDialog(true);
  };

  const handleAddTeacher = () => {
    showSuccess('Add teacher feature coming soon!');
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    showSuccess('Edit teacher feature coming soon!');
  };

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    showSuccess('View teacher feature coming soon!');
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
    setEditingParent(parent);
    setShowParentModal(true);
  };

  const handleSaveParent = (parentData) => {
    if (editingParent) {
      setParents(parents.map(p => p.id === editingParent.id ? parentData : p));
      showSuccess('Parent updated successfully!');
    } else {
      setParents([...parents, parentData]);
      showSuccess('Parent added successfully!');
    }
    setShowParentModal(false);
    setEditingParent(null);
  };

  const handleDeleteParent = (parentId) => {
    setConfirmAction(() => () => {
      setShowConfirmDialog(false);
      showSuccess('Parent deleted successfully');
    });
    setShowConfirmDialog(true);
  };

  // Render Current Page
  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard learners={learners} teachers={teachers} />;
      
      // Learners Module
      case 'learners-list':
        return (
          <LearnersList
            learners={learners}
            onAddLearner={handleAddLearner}
            onEditLearner={handleEditLearner}
            onViewLearner={handleViewLearner}
            onMarkAsExited={handleMarkAsExited}
            onDeleteLearner={handleDeleteLearner}
          />
        );
      case 'learners-admissions':
        return <AdmissionsPage />;
      case 'learners-transfers-in':
        return <TransfersInPage />;
      case 'learners-exited':
        return <ExitedLearnersPage />;
      case 'learners-promotion':
        return <PromotionPage learners={learners} />;
      case 'learners-transfer-out':
        return <TransferOutPage learners={learners} />;
      
      // Teachers Module
      case 'teachers-list':
        return (
          <TeachersList
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onEditTeacher={handleEditTeacher}
            onViewTeacher={handleViewTeacher}
          />
        );
      
      // Parents Module
      case 'parents-list':
        return (
          <ParentsList
            parents={parents}
            onAddParent={handleAddParent}
            onEditParent={handleEditParent}
            onViewParent={handleViewParent}
            onDeleteParent={handleDeleteParent}
          />
        );
      
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
        return <SummativeTests />;
      case 'assess-summative-assessment':
        return <SummativeAssessment learners={learners} />;
      case 'assess-summative-report':
        return <SummativeReport learners={learners} />;
      case 'assess-termly-report':
        return <TermlyReport learners={learners} />;
      case 'assess-performance-scale':
        return <PerformanceScale />;
      
      // Communications Module
      case 'comm-notices':
        return <NoticesPage />;
      case 'comm-messages':
        return <MessagesPage />;
      
      // Help Module
      case 'help':
        return <HelpPage />;
      
      // Settings Module
      case 'settings-school':
        return <SchoolSettings brandingSettings={brandingSettings} setBrandingSettings={setBrandingSettings} />;
      case 'settings-academic':
        return <AcademicSettings />;
      case 'settings-users':
        return <UserManagement />;
      case 'settings-branding':
        return <BrandingSettings />;
      case 'settings-backup':
        return <BackupSettings />;
      
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
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderPage()}
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
