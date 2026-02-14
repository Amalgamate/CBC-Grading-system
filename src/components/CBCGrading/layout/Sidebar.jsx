/**
 * Sidebar Component
 * Navigation sidebar with collapsible sections
 * Role-based permission filtering - Tutors hidden from teachers
 * Focus mode: Only showing Students, Tutors, Parents, Assessment, and Settings
 */

import React, { useMemo, useState } from 'react';
import {
  Folder, Menu, X, Home, Users, Settings,
  BarChart3, ChevronDown, GraduationCap, ClipboardList, Megaphone, UserPlus, HelpCircle, DollarSign,
  UserCog, BookOpen, Bus, Fingerprint, Calendar, BookMarked,
  Briefcase, Wallet, Calculator, Box, School, Scroll
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';

// Modules to focus on - others will be hidden
const focusModules = ['dashboard', 'communications', 'planner', 'learners', 'teachers', 'parents', 'assessment', 'learning-hub', 'timetable', 'attendance', 'fees', 'docs-center', 'knowledge-base', 'settings', 'hr', 'finance', 'accounting', 'inventory'];

// Define all navigation sections with their required permissions
const allNavSections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    items: [],
    permission: null // Always visible
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: Megaphone,
    permission: null, // All roles can access communications
    items: [
      { id: 'comm-notices', label: 'Notices & Announcements', path: 'comm-notices', permission: null },
      { id: 'comm-messages', label: 'Messages', path: 'comm-messages', permission: 'VIEW_INBOX' }
    ]
  },
  {
    id: 'planner',
    label: 'Planner',
    icon: Calendar,
    permission: null,
    items: [
      { id: 'planner-calendar', label: 'Calendar', path: 'planner-calendar', permission: null },
      { id: 'planner-timetable', label: 'Timetable', path: 'planner-timetable', permission: null },
    ]
  },
  {
    id: 'learners',
    label: 'Students',
    icon: Users,
    permission: null, // Section visible to TEACHER, ADMIN, etc.
    items: [
      { id: 'learners-list', label: 'Students List', path: 'learners-list', permission: 'VIEW_ALL_LEARNERS' },
      { id: 'learners-admissions', label: 'Admissions', path: 'learners-admissions', permission: 'CREATE_LEARNER' },
      { id: 'learners-promotion', label: 'Promotion', path: 'learners-promotion', permission: 'PROMOTE_LEARNER' }
    ]
  },
  {
    id: 'teachers',
    label: 'Tutors',
    icon: GraduationCap,
    permission: 'MANAGE_TEACHERS', // Only admins can manage teachers - HIDDEN FROM TEACHERS
    items: [
      { id: 'teachers-list', label: 'Tutors List', path: 'teachers-list', permission: 'MANAGE_TEACHERS' }
    ]
  },
  {
    id: 'parents',
    label: 'Parents',
    icon: UserPlus,
    permission: 'VIEW_ALL_USERS', // Teachers can view parents
    items: [
      { id: 'parents-list', label: 'Parents List', path: 'parents-list', permission: 'VIEW_ALL_USERS' }
    ]
  },
  {
    id: 'assessment',
    label: 'Assessment',
    icon: BarChart3,
    permission: 'ACCESS_ASSESSMENT_MODULE', // Only teachers, admins, head teachers
    items: [
      {
        id: 'group-summative',
        label: 'Summative',
        type: 'group',
        icon: Calculator,
        items: [
          { id: 'assess-summative-assessment', label: 'Assessments', path: 'assess-summative-assessment', permission: 'ACCESS_ASSESSMENT_MODULE' },
          { id: 'assess-summative-report', label: 'Reports', path: 'assess-summative-report', permission: 'ACCESS_ASSESSMENT_MODULE' },
        ]
      },
      {
        id: 'group-formative',
        label: 'Formative',
        type: 'group',
        icon: ClipboardList,
        items: [
          { id: 'assess-formative', label: 'Assessments', path: 'assess-formative', permission: 'ACCESS_ASSESSMENT_MODULE' },
          { id: 'assess-formative-report', label: 'Reports', path: 'assess-formative-report', permission: 'ACCESS_ASSESSMENT_MODULE' },
        ]
      },
      {
        id: 'group-general',
        label: 'Configuration',
        type: 'group',
        icon: Settings,
        items: [
          { id: 'assess-summative-tests', label: 'Tests', path: 'assess-summative-tests', permission: 'ACCESS_ASSESSMENT_MODULE' },
          { id: 'assess-performance-scale', label: 'Performance Scale', path: 'assess-performance-scale', permission: 'ACCESS_ASSESSMENT_MODULE' }
        ]
      }
    ]
  },
  {
    id: 'learning-hub',
    label: 'Learning Hub',
    icon: BookMarked,
    permission: null, // Teachers can create, students/parents can view
    items: [
      { id: 'learning-hub-materials', label: 'Class Materials', path: 'learning-hub-materials', permission: null },
      { id: 'learning-hub-assignments', label: 'Assignments', path: 'learning-hub-assignments', permission: null },
      { id: 'learning-hub-lesson-plans', label: 'Lesson Plans', path: 'learning-hub-lesson-plans', permission: 'ACCESS_LEARNING_HUB' },
      { id: 'coding-playground', label: 'Coding Playground', path: 'coding-playground', permission: null },
      { id: 'learning-hub-library', label: 'Resource Library', path: 'learning-hub-library', permission: null }
    ]
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    permission: null, // Teachers need to see their timetable
    items: []
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: ClipboardList,
    permission: null, // Teachers can mark attendance
    items: [
      { id: 'attendance-daily', label: 'Daily Attendance', path: 'attendance-daily', permission: 'MARK_ATTENDANCE' },
      { id: 'attendance-reports', label: 'Attendance Reports', path: 'attendance-reports', permission: 'GENERATE_ATTENDANCE_REPORTS' }
    ]
  },
  {
    id: 'docs-center',
    label: 'Docs',
    icon: Scroll,
    permission: null,
    items: []
  },
  {
    id: 'knowledge-base',
    label: 'Knowledge Base',
    icon: BookOpen,
    permission: null,
    items: []
  },

  {
    id: 'fees',
    label: 'Fee Management',
    icon: DollarSign,
    permission: 'FEE_MANAGEMENT', // Only admins and accountants
    items: [
      { id: 'fees-structure', label: 'Fee Structure', path: 'fees-structure', permission: 'FEE_MANAGEMENT' },
      { id: 'fees-collection', label: 'Fee Collection', path: 'fees-collection', permission: 'FEE_MANAGEMENT' },
      { id: 'fees-reports', label: 'Fee Reports', path: 'fees-reports', permission: 'FEE_MANAGEMENT' },
      { id: 'fees-statements', label: 'Student Statements', path: 'fees-statements', permission: 'FEE_MANAGEMENT' }
    ]
  },
  {
    id: 'hr',
    label: 'Human Resources',
    icon: UserCog,
    permission: 'HR_MANAGEMENT', // Only admins and HR personnel
    items: [
      { id: 'hr-staff-profiles', label: 'Staff Profiles & Roles', path: 'hr-staff-profiles', permission: 'HR_MANAGEMENT', comingSoon: true },
      { id: 'hr-payroll', label: 'Payroll Processing', path: 'hr-payroll', permission: 'HR_MANAGEMENT', comingSoon: true },
      { id: 'hr-leave', label: 'Leave & Attendance', path: 'hr-leave', permission: 'HR_MANAGEMENT', comingSoon: true },
      { id: 'hr-performance', label: 'Performance Evaluations', path: 'hr-performance', permission: 'HR_MANAGEMENT', comingSoon: true },
      { id: 'hr-documents', label: 'Staff Documents', path: 'hr-documents', permission: 'HR_MANAGEMENT', comingSoon: true }
    ]
  },
  {
    id: 'library',
    label: 'Library Management',
    icon: BookOpen,
    permission: 'LIBRARY_MANAGEMENT', // Admins and librarians
    items: [
      { id: 'library-catalog', label: 'Book Catalog', path: 'library-catalog', permission: 'LIBRARY_MANAGEMENT', comingSoon: true },
      { id: 'library-circulation', label: 'Borrow/Return Tracking', path: 'library-circulation', permission: 'LIBRARY_MANAGEMENT', comingSoon: true },
      { id: 'library-fees', label: 'Late Fee Automation', path: 'library-fees', permission: 'LIBRARY_MANAGEMENT', comingSoon: true },
      { id: 'library-inventory', label: 'Inventory Reports', path: 'library-inventory', permission: 'LIBRARY_MANAGEMENT', comingSoon: true },
      { id: 'library-members', label: 'Member Management', path: 'library-members', permission: 'LIBRARY_MANAGEMENT', comingSoon: true }
    ]
  },
  {
    id: 'transport',
    label: 'Transport & Hostel',
    icon: Bus,
    permission: 'TRANSPORT_MANAGEMENT', // Admins and transport managers
    items: [
      { id: 'transport-routes', label: 'Bus Routes & Roster', path: 'transport-routes', permission: 'TRANSPORT_MANAGEMENT', comingSoon: true },
      { id: 'transport-tracking', label: 'GPS Tracking', path: 'transport-tracking', permission: 'TRANSPORT_MANAGEMENT', comingSoon: true },
      { id: 'transport-drivers', label: 'Driver Management', path: 'transport-drivers', permission: 'TRANSPORT_MANAGEMENT', comingSoon: true },
      { id: 'hostel-allocation', label: 'Hostel Room Allocation', path: 'hostel-allocation', permission: 'TRANSPORT_MANAGEMENT', comingSoon: true },
      { id: 'hostel-fees', label: 'Transport/Hostel Fees', path: 'hostel-fees', permission: 'TRANSPORT_MANAGEMENT', comingSoon: true },
      { id: 'transport-reports', label: 'Transport Reports', path: 'transport-reports', permission: 'TRANSPORT_MANAGEMENT', comingSoon: true }
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    permission: 'SCHOOL_SETTINGS',
    items: [],
    comingSoon: true,
    greyedOut: true
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: Calculator,
    permission: 'SCHOOL_SETTINGS',
    items: [],
    comingSoon: true,
    greyedOut: true
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Box,
    permission: 'SCHOOL_SETTINGS',
    items: [
      { id: 'inventory-books', label: 'Books & Resources', path: 'inventory-books', permission: 'SCHOOL_SETTINGS' }
    ]
  },
  {
    id: 'biometric',
    label: 'Biometric Attendance',
    icon: Fingerprint,
    permission: 'BIOMETRIC_ATTENDANCE', // Admins and attendance managers
    items: [
      { id: 'biometric-devices', label: 'Device Management', path: 'biometric-devices', permission: 'BIOMETRIC_ATTENDANCE', comingSoon: true },
      { id: 'biometric-enrollment', label: 'Fingerprint Enrollment', path: 'biometric-enrollment', permission: 'BIOMETRIC_ATTENDANCE', comingSoon: true },
      { id: 'biometric-logs', label: 'Attendance Logs', path: 'biometric-logs', permission: 'BIOMETRIC_ATTENDANCE', comingSoon: true },
      { id: 'biometric-reports', label: 'Biometric Reports', path: 'biometric-reports', permission: 'BIOMETRIC_ATTENDANCE', comingSoon: true },
      { id: 'biometric-api', label: 'API Integration', path: 'biometric-api', permission: 'BIOMETRIC_ATTENDANCE', comingSoon: true }
    ]
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    permission: null, // Always visible
    items: []
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    permission: 'SCHOOL_SETTINGS', // Only ADMIN and SUPER_ADMIN
    items: [
      { id: 'settings-school', label: 'School Settings', path: 'settings-school', permission: 'SCHOOL_SETTINGS' },
      { id: 'settings-academic', label: 'Academic Settings', path: 'settings-academic', permission: 'ACADEMIC_SETTINGS' },
      { id: 'settings-communication', label: 'Communication Settings', path: 'settings-communication', permission: 'SCHOOL_SETTINGS' },
      { id: 'settings-payment', label: 'Payment Settings', path: 'settings-payment', permission: 'SCHOOL_SETTINGS' },
      { id: 'settings-users', label: 'User Management', path: 'settings-users', permission: 'EDIT_USER' },
      { id: 'settings-branding', label: 'Branding', path: 'settings-branding', permission: 'BRANDING_SETTINGS' },
      { id: 'settings-backup', label: 'Backup & Restore', path: 'settings-backup', permission: 'BACKUP_SETTINGS' }
    ]
  }
];

// Prefetch helper to speed up lazy loading
const prefetchModule = (path) => {
  if (!path || path.startsWith('http')) return;
  // This triggers the browser to start downloading the module chunk
  // before the user even clicks it.
  try {
    if (path.includes('settings')) {
      const settingsMap = {
        'settings-school': 'SchoolSettings',
        'settings-academic': 'AcademicSettings',
        'settings-communication': 'CommunicationSettings',
        'settings-payment': 'PaymentSettings',
        'settings-users': 'UserManagement',
        'settings-branding': 'BrandingSettings',
        'settings-backup': 'BackupSettings'
      };
      const fileName = settingsMap[path];
      if (fileName) {
        import(`../pages/settings/${fileName}.jsx`);
      }
    } else if (path.includes('profile')) {
      const name = path.replace('-profile', '');
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1) + 'Profile';
      import(`../pages/profiles/${capitalized}.jsx`);
    } else if (path === 'dashboard') {
      import('../pages/dashboard/RoleDashboard.jsx');
    } else {
      // Map common paths to their filenames
      const fileMap = {
        'learners-list': 'LearnersList',
        'learners-admissions': 'AdmissionsPage',
        'learners-promotion': 'PromotionPage',
        'teachers-list': 'TeachersList',
        'parents-list': 'ParentsList',
        'assess-summative-assessment': 'SummativeAssessment',
        'assess-summative-report': 'SummativeReport',
        'assess-formative': 'FormativeAssessment',
        'assess-formative-report': 'FormativeReport',
        'assess-summative-tests': 'SummativeTests',
        'assess-performance-scale': 'PerformanceScale',
        'fees-collection': 'FeeCollectionPage',
        'fees-structure': 'FeeStructurePage',
        'fees-reports': 'FeeReportsPage',
        'fees-statements': 'StudentStatementsPage',
        'docs-center': 'DocumentCenter',
        'knowledge-base': 'KnowledgeBase',
        'coding-playground': 'CodingPlayground',
        'timetable': 'TimetablePage',
        'attendance-daily': 'DailyAttendanceAPI',
        'attendance-reports': 'AttendanceReports',
        'comm-notices': 'NoticesPage',
        'comm-messages': 'MessagesPage',
        'learning-hub-materials': 'LearningHubPage',
        'learning-hub-assignments': 'LearningHubPage',
        'learning-hub-lesson-plans': 'LearningHubPage',
        'learning-hub-library': 'LearningHubPage',
        'inventory-books': 'InventoryList',
        'help': 'SupportHub'
      };
      const fileName = fileMap[path] || (path.charAt(0).toUpperCase() + path.slice(1));
      import(`../pages/${fileName}.jsx`);
    }
  } catch (e) {
    // Fail silently, prefetching is a non-critical optimization
  }
};

// Helper to find the first navigable path in a section
const findDefaultPath = (items) => {
  for (const item of items) {
    if (item.type === 'group') {
      const path = findDefaultPath(item.items);
      if (path) return path;
    } else {
      if (!item.comingSoon && !item.greyedOut && item.path) {
        return item.path;
      }
    }
  }
  return null;
};

const Sidebar = React.memo(({
  sidebarOpen,
  setSidebarOpen,
  currentPage,
  onNavigate,
  expandedSections,
  toggleSection,
  brandingSettings
}) => {
  const { can, role } = usePermissions();
  const [expandedSubSections, setExpandedSubSections] = useState({
    'group-summative': true,
    'group-formative': false,
    'group-general': true
  });

  const toggleSubSection = (id) => {
    setExpandedSubSections(prev => {
      const isOpening = !prev[id];
      if (isOpening) {
        // Close all other sub-sections
        const newState = Object.keys(prev).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {});
        newState[id] = true;
        return newState;
      } else {
        // Just toggling off
        return { ...prev, [id]: false };
      }
    });
  };

  // Filter navigation sections based on user permissions AND focus modules
  const navSections = useMemo(() => {
    const isItemVisible = (item) => !item.permission || can(item.permission);

    const processItems = (items) => {
      return items.reduce((acc, item) => {
        if (item.type === 'group') {
          const visibleChildren = item.items.filter(isItemVisible);
          if (visibleChildren.length > 0) {
            acc.push({ ...item, items: visibleChildren });
          }
        } else {
          if (isItemVisible(item)) {
            acc.push(item);
          }
        }
        return acc;
      }, []);
    };

    return allNavSections.filter(section => {
      // First check if this section is in our focus modules
      if (!focusModules.includes(section.id)) {
        return false; // Hide non-focus modules
      }

      // Settings is handled separately at the bottom
      if (section.id === 'settings') {
        return false;
      }

      // If section has permission requirement, check it
      if (section.permission && !can(section.permission)) {
        return false;
      }
      // If no permission required on section, check if any items are visible
      if (section.items.length > 0) {
        const visibleItems = processItems(section.items);
        return visibleItems.length > 0;
      }
      // Section with no items and no permission - always visible
      return true;
    })
      .map(section => ({
        ...section,
        items: processItems(section.items)
      }));
  }, [can]);

  // Find settings section separately
  const settingsSection = useMemo(() => {
    const section = allNavSections.find(s => s.id === 'settings');
    if (!section || !can(section.permission)) return null;

    const isItemVisible = (item) => !item.permission || can(item.permission);
    return {
      ...section,
      items: section.items.filter(isItemVisible)
    };
  }, [can]);

  // Group sections
  const educationSections = useMemo(() => navSections.filter(s =>
    ['learners', 'teachers', 'parents', 'assessment', 'learning-hub', 'timetable', 'attendance'].includes(s.id)
  ), [navSections]);

  const sharedSections = useMemo(() => navSections.filter(s =>
    ['docs-center', 'knowledge-base'].includes(s.id)
  ), [navSections]);

  const schoolSections = useMemo(() => navSections.filter(s =>
    ['fees', 'hr', 'finance', 'accounting', 'inventory', 'library', 'transport', 'biometric'].includes(s.id)
  ), [navSections]);

  const dashboardSection = navSections.find(s => s.id === 'dashboard');
  const communicationSection = navSections.find(s => s.id === 'communications');
  const helpSection = navSections.find(s => s.id === 'help');

  const handleSectionClick = (section) => {
    if (sidebarOpen) {
      toggleSection(section.id);
    } else {
      // If sidebar is collapsed, navigate to the first available item in the section
      const defaultPath = findDefaultPath(section.items);
      if (defaultPath) {
        onNavigate(defaultPath);
      } else {
        // If no path found (e.g. all items hidden or coming soon), expand sidebar to show options
        setSidebarOpen(true);
        toggleSection(section.id);
      }
    }
  };

  const [activeCategory, setActiveCategory] = useState(() => {
    const learningRoles = ['TEACHER', 'PARENT'];
    const schoolRoles = ['ACCOUNTANT', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'HEAD_TEACHER'];
    if (learningRoles.includes(role)) return 'learning';
    if (schoolRoles.includes(role)) return 'school';
    return 'learning';
  });

  const toggleCategory = (category) => {
    setActiveCategory(prev => prev === category ? null : category);
  };

  // Auto-expand category based on current page
  React.useEffect(() => {
    const isEducation = educationSections.some(s =>
      s.id === currentPage || s.items.some(i => i.path === currentPage || (i.type === 'group' && i.items.some(si => si.path === currentPage)))
    );
    const isSchool = schoolSections.some(s =>
      s.id === currentPage || s.items.some(i => i.path === currentPage)
    );
    const isUtilities = sharedSections.some(s =>
      s.id === currentPage || s.items.some(i => i.path === currentPage)
    );

    if (isEducation) setActiveCategory('learning');
    else if (isSchool) setActiveCategory('school');
    else if (isUtilities) setActiveCategory('utilities');
    else if (currentPage === 'settings-school' || currentPage.startsWith('settings-')) setActiveCategory('settings');
  }, [currentPage, educationSections, schoolSections, sharedSections]);

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#2e1d2b] text-white transition-all duration-300 flex flex-col border-r border-gray-800`}>
      {/* Logo/Brand */}
      <div className="p-5 border-b border-white/10 bg-[#714B67]">
        <div className="flex items-center gap-3 justify-center overflow-hidden">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-white tracking-wide truncate w-full text-center">
              {brandingSettings?.schoolName || 'Elimcrown'}
            </h1>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">
                {(brandingSettings?.schoolName || 'EL').substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 bg-[#2e1d2b] custom-scrollbar">
        <div className="space-y-4">
          {/* Dashboard */}
          {dashboardSection && (
            <div key={dashboardSection.id}>
              <button
                onClick={() => onNavigate(dashboardSection.id)}
                onMouseEnter={() => prefetchModule(dashboardSection.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${currentPage === dashboardSection.id
                  ? 'bg-white/5 text-[#0D9488] border-l-4 border-[#0D9488]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                  }`}
              >
                <div className="min-w-[20px] flex justify-center">
                  <dashboardSection.icon size={18} />
                </div>
                {sidebarOpen && <span className="text-sm font-medium">{dashboardSection.label}</span>}
              </button>
            </div>
          )}


          {/* Communications */}
          {communicationSection && (
            <div key={communicationSection.id}>
              <NavSection
                section={communicationSection}
                expandedSections={expandedSections}
                handleSectionClick={handleSectionClick}
                sidebarOpen={sidebarOpen}
                expandedSubSections={expandedSubSections}
                toggleSubSection={toggleSubSection}
                currentPage={currentPage}
                onNavigate={onNavigate}
              />
            </div>
          )}

          {/* Learning Management */}
          {educationSections.length > 0 && (
            <div className="space-y-1">
              {sidebarOpen && (
                <button
                  onClick={() => toggleCategory('learning')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-[20px] flex justify-center">
                      <GraduationCap size={18} className="opacity-70" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold opacity-80">Learning Management</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeCategory === 'learning' ? 'rotate-180' : ''}`} />
                </button>
              )}
              {(!sidebarOpen || activeCategory === 'learning') && (
                <div className={sidebarOpen ? "animate-in fade-in slide-in-from-top-1 duration-200" : ""}>
                  {educationSections.map(section => (
                    <NavSection
                      key={section.id}
                      section={section}
                      expandedSections={expandedSections}
                      handleSectionClick={handleSectionClick}
                      sidebarOpen={sidebarOpen}
                      expandedSubSections={expandedSubSections}
                      toggleSubSection={toggleSubSection}
                      currentPage={currentPage}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* School Management */}
          {schoolSections.length > 0 && (
            <div className="space-y-1">
              {sidebarOpen && (
                <button
                  onClick={() => toggleCategory('school')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-[20px] flex justify-center">
                      <School size={18} className="opacity-70" />
                    </div>
                    <span className="uppercase text-[10px] tracking-wider font-semibold opacity-80">School Management</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeCategory === 'school' ? 'rotate-180' : ''}`} />
                </button>
              )}
              {(!sidebarOpen || activeCategory === 'school') && (
                <div className={sidebarOpen ? "animate-in fade-in slide-in-from-top-1 duration-200" : ""}>
                  {schoolSections.map(section => (
                    <NavSection
                      key={section.id}
                      section={section}
                      expandedSections={expandedSections}
                      handleSectionClick={handleSectionClick}
                      sidebarOpen={sidebarOpen}
                      expandedSubSections={expandedSubSections}
                      toggleSubSection={toggleSubSection}
                      currentPage={currentPage}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Institutional Utilities */}
          {sharedSections.length > 0 && (
            <div className="space-y-1">
              {sidebarOpen && (
                <button
                  onClick={() => toggleCategory('utilities')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-[20px] flex justify-center">
                      <Box size={18} className="opacity-70" />
                    </div>
                    <span className="uppercase text-[10px] tracking-[0.2em] font-black opacity-80">Utilities</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeCategory === 'utilities' ? 'rotate-180' : ''}`} />
                </button>
              )}
              {(!sidebarOpen || activeCategory === 'utilities') && (
                <div className={sidebarOpen ? "animate-in fade-in slide-in-from-top-1 duration-200" : ""}>
                  {sharedSections.map(section => (
                    <NavSection
                      key={section.id}
                      section={section}
                      expandedSections={expandedSections}
                      handleSectionClick={handleSectionClick}
                      sidebarOpen={sidebarOpen}
                      expandedSubSections={expandedSubSections}
                      toggleSubSection={toggleSubSection}
                      currentPage={currentPage}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Help & Support */}
          {helpSection && (
            <div key={helpSection.id}>
              <button
                onClick={() => onNavigate(helpSection.id)}
                onMouseEnter={() => prefetchModule(helpSection.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${currentPage === helpSection.id
                  ? 'bg-white/5 text-[#0D9488] border-l-4 border-[#0D9488]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                  }`}
              >
                <div className="min-w-[20px] flex justify-center">
                  <helpSection.icon size={18} />
                </div>
                {sidebarOpen && <span className="text-sm font-medium">{helpSection.label}</span>}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Settings (Admin Only) */}
      <div className="p-3 border-t border-white/10">
        {settingsSection && (
          <div className="mb-2">
            <NavSection
              section={settingsSection}
              expandedSections={expandedSections}
              handleSectionClick={handleSectionClick}
              sidebarOpen={sidebarOpen}
              expandedSubSections={expandedSubSections}
              toggleSubSection={toggleSubSection}
              currentPage={currentPage}
              onNavigate={onNavigate}
              isBottom={true}
            />
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition text-gray-400 hover:bg-[#0D9488] hover:text-white"
        >
          {sidebarOpen ? (
            <>
              <X size={20} />
              <span className="text-sm font-medium">Collapse Menu</span>
            </>
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>
    </div>
  );
});

// Helper component to avoid repetition
const NavSection = React.memo(({
  section,
  expandedSections,
  handleSectionClick,
  sidebarOpen,
  expandedSubSections,
  toggleSubSection,
  currentPage,
  onNavigate,
  isBottom = false
}) => {
  return (
    <div key={section.id}>
      {section.items.length > 0 ? (
        <>
          <button
            onClick={() => handleSectionClick(section)}
            onMouseEnter={() => {
              // Only prefetch first item if collapsed
              if (!sidebarOpen) {
                const defaultPath = findDefaultPath(section.items);
                if (defaultPath) prefetchModule(defaultPath);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 group ${section.id === 'assessment'
              ? (expandedSections[section.id] ? 'bg-white/5 text-[#F59E0B] border-l-4 border-[#F59E0B]' : 'text-[#F59E0B] hover:bg-white/5 border-l-4 border-transparent')
              : (expandedSections[section.id] ? 'bg-white/5 text-white border-l-4 border-white/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent')
              }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="min-w-[20px] flex justify-center">
                <section.icon size={18} className={section.id === 'assessment' ? 'text-[#F59E0B]' : ''} />
              </div>
              {sidebarOpen && <span className="text-sm font-medium">{section.label}</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown
                size={14}
                className={`transition ${expandedSections[section.id] ? 'rotate-180' : ''} opacity-50`}
              />
            )}
          </button>
          {expandedSections[section.id] && sidebarOpen && (
            <div className={`ml-6 space-y-0.5 mt-1 border-l border-white/10 ${isBottom ? 'mb-2' : ''}`}>
              {section.items.map((item) => {
                if (item.type === 'group') {
                  return (
                    <div key={item.id} className="mt-2 mb-1">
                      <button
                        onClick={() => toggleSubSection(item.id)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon size={12} className="opacity-70" />}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown size={10} className={`transition-transform duration-200 opacity-50 ${expandedSubSections[item.id] ? 'rotate-180' : ''}`} />
                      </button>

                      {expandedSubSections[item.id] && (
                        <div className="space-y-0.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                          {item.items.map(subItem => (
                            <button
                              key={subItem.id}
                              onClick={() => (subItem.comingSoon || subItem.greyedOut) ? null : onNavigate(subItem.path)}
                              onMouseEnter={() => prefetchModule(subItem.path)}
                              className={`w-full text-left px-3 py-1.5 rounded-r-md text-sm transition flex items-center justify-between ${subItem.comingSoon || subItem.greyedOut
                                ? 'text-gray-600 cursor-not-allowed'
                                : (currentPage === subItem.path
                                  ? 'bg-white/5 text-[#0D9488] font-medium border-l-2 border-[#0D9488]'
                                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent')
                                }`}
                              disabled={subItem.comingSoon || subItem.greyedOut}
                            >
                              <span className="truncate">{subItem.label}</span>
                              {subItem.comingSoon && (
                                <span className="text-[8px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded font-medium uppercase border border-[#F59E0B]/30">
                                  Soon
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => (item.comingSoon || item.greyedOut) ? null : onNavigate(item.path)}
                    onMouseEnter={() => prefetchModule(item.path)}
                    className={`w-full text-left px-3 py-1.5 rounded-r-md text-sm transition flex items-center justify-between ${item.comingSoon || item.greyedOut
                      ? 'text-gray-600 cursor-not-allowed'
                      : (currentPage === item.path
                        ? 'bg-white/5 text-[#0D9488] font-medium border-l-2 border-[#0D9488]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent')
                      }`}
                    disabled={item.comingSoon || item.greyedOut}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.comingSoon && (
                      <span className="text-[8px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded font-medium uppercase border border-[#F59E0B]/30">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => (section.comingSoon || section.greyedOut) ? null : onNavigate(section.id)}
          onMouseEnter={() => prefetchModule(section.id)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${section.comingSoon || section.greyedOut
            ? 'text-gray-500 opacity-50 cursor-not-allowed border border-dashed border-white/5'
            : (currentPage === section.id
              ? 'bg-white/5 text-[#0D9488] border-l-4 border-[#0D9488]'
              : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent')
            }`}
          disabled={section.comingSoon || section.greyedOut}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="min-w-[20px] flex justify-center">
              <section.icon size={18} />
            </div>
            {sidebarOpen && <span className="text-sm font-medium">{section.label}</span>}
          </div>
          {sidebarOpen && section.comingSoon && (
            <span className="text-[8px] bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded font-medium uppercase border border-[#F59E0B]/30">
              Soon
            </span>
          )}
        </button>
      )}
    </div>
  );
});

NavSection.displayName = 'NavSection';
Sidebar.displayName = 'Sidebar';

export default Sidebar;
