/**
 * Sidebar Component
 * Navigation sidebar with collapsible sections
 * Role-based permission filtering - Tutors hidden from teachers
 * Focus mode: Only showing Students, Tutors, Parents, Assessment, and Settings
 */

import React, { useMemo, useState } from 'react';
import {
  Menu, X, Home, Users, Settings,
  BarChart3, ChevronDown, GraduationCap, ClipboardList, Megaphone, UserPlus, HelpCircle, DollarSign,
  UserCog, BookOpen, Bus, Fingerprint, Calendar, BookMarked
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';

// Modules to focus on - others will be hidden
const focusModules = ['dashboard', 'learners', 'teachers', 'parents', 'assessment', 'communications', 'settings'];

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
        items: [
          { id: 'assess-summative-assessment', label: 'Assessments', path: 'assess-summative-assessment', permission: 'ACCESS_ASSESSMENT_MODULE' },
          { id: 'assess-summative-report', label: 'Reports', path: 'assess-summative-report', permission: 'ACCESS_ASSESSMENT_MODULE' },
        ]
      },
      {
        id: 'group-formative',
        label: 'Formative',
        type: 'group',
        items: [
          { id: 'assess-formative', label: 'Assessments', path: 'assess-formative', permission: 'ACCESS_ASSESSMENT_MODULE', greyedOut: true },
          { id: 'assess-formative-report', label: 'Reports', path: 'assess-formative-report', permission: 'ACCESS_ASSESSMENT_MODULE', greyedOut: true },
        ]
      },
      {
        id: 'group-general',
        label: 'General',
        type: 'group',
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
      { id: 'learning-hub-lesson-plans', label: 'Lesson Plans', path: 'learning-hub-lesson-plans', permission: 'ACCESS_ASSESSMENT_MODULE' },
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

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  currentPage,
  onNavigate,
  expandedSections,
  toggleSection,
  brandingSettings
}) => {
  const { can } = usePermissions();
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

    return allNavSections
      .filter(section => {
        // First check if this section is in our focus modules
        if (!focusModules.includes(section.id)) {
          return false; // Hide non-focus modules
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

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#2e1d2b] text-white transition-all duration-300 flex flex-col border-r border-gray-800`}>
      {/* Logo/Brand */}
      <div className="p-5 border-b border-white/10 bg-[#714B67]">
        <div className="flex items-center gap-3 justify-center">
          {sidebarOpen ? (
            <img
              src={brandingSettings?.logoUrl || '/logo-landscape.png'}
              alt="EDucore Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => { e.target.src = '/logo-landscape.png'; }}
            />
          ) : (
            <img
              src={'/logo-new.png'}
              alt="EDucore Icon"
              className="w-10 h-10 object-contain"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#2e1d2b]">
        {navSections.map((section) => (
          <div key={section.id}>
            {section.items.length > 0 ? (
              <>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all duration-200 group ${section.id === 'assessment'
                    ? (expandedSections[section.id] ? 'bg-[#F59E0B] text-gray-900 font-bold shadow-lg' : 'bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-gray-900 border border-[#F59E0B]/20')
                    : (expandedSections[section.id] ? 'bg-[#0D9488] text-white font-bold shadow-md' : 'text-gray-300 hover:bg-white/10 hover:text-white')
                    }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <section.icon size={20} className={section.id === 'assessment' && !expandedSections[section.id] ? 'text-[#F59E0B] group-hover:text-gray-900' : ''} />
                    {sidebarOpen && <span className="text-sm font-medium">{section.label}</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown
                      size={16}
                      className={`transition ${expandedSections[section.id] ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                {expandedSections[section.id] && sidebarOpen && (
                  <div className="ml-3 space-y-1 mt-1 pl-2 border-l border-white/10">
                    {section.items.map((item) => {
                      if (item.type === 'group') {
                        return (
                          <div key={item.id} className="mb-2 mt-2">
                            <button
                              onClick={() => toggleSubSection(item.id)}
                              className="w-full flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-white transition-colors mb-1"
                            >
                              <span>{item.label}</span>
                              <ChevronDown size={10} className={`transition-transform duration-200 ${expandedSubSections[item.id] ? 'rotate-180' : ''}`} />
                            </button>

                            {expandedSubSections[item.id] && (
                              <div className="space-y-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                {item.items.map(subItem => (
                                  <button
                                    key={subItem.id}
                                    onClick={() => (subItem.comingSoon || subItem.greyedOut) ? null : onNavigate(subItem.path)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex items-center justify-between ${subItem.comingSoon || subItem.greyedOut
                                      ? 'text-gray-600 cursor-not-allowed'
                                      : (currentPage === subItem.path
                                        ? 'bg-white/10 text-[#0D9488] font-bold border-l-4 border-[#0D9488]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5')
                                      }`}
                                    disabled={subItem.comingSoon || subItem.greyedOut}
                                  >
                                    <span>{subItem.label}</span>
                                    {subItem.comingSoon && (
                                      <span className="text-[9px] bg-[#F59E0B] text-white px-1.5 py-0.5 rounded font-bold uppercase">
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
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex items-center justify-between ${item.comingSoon || item.greyedOut
                            ? 'text-gray-600 cursor-not-allowed'
                            : (currentPage === item.path
                              ? 'bg-white/10 text-[#0D9488] font-bold border-l-4 border-[#0D9488]'
                              : 'text-gray-400 hover:text-white hover:bg-white/5')
                            }`}
                          disabled={item.comingSoon || item.greyedOut}
                        >
                          <span>{item.label}</span>
                          {item.comingSoon && (
                            <span className="text-[9px] bg-[#F59E0B] text-white px-1.5 py-0.5 rounded font-bold uppercase">
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
                onClick={() => onNavigate(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition ${currentPage === section.id
                  ? 'bg-[#0D9488] text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <section.icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{section.label}</span>}
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-4 border-t border-white/10 hover:bg-[#0D9488] transition-colors text-gray-400 hover:text-white"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
};

export default Sidebar;
