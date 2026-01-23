/**
 * Sidebar Component
 * Navigation sidebar with collapsible sections
 * Role-based permission filtering - Tutors hidden from teachers
 * Focus mode: Only showing Students, Tutors, Parents, Assessment, and Settings
 */

import React, { useMemo } from 'react';
import { 
  Menu, X, Home, Users, Settings, 
  BarChart3, ChevronDown, GraduationCap, ClipboardList, Megaphone, UserPlus, HelpCircle, DollarSign,
  UserCog, BookOpen, Bus, Fingerprint, Calendar, BookMarked
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentPage, 
  onNavigate,
  expandedSections,
  toggleSection,
  brandingSettings
}) => {
  const { can, isRole, isAnyRole } = usePermissions();

  // Modules to focus on - others will be hidden
  const focusModules = ['dashboard', 'learners', 'teachers', 'parents', 'assessment', 'settings'];

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
        { id: 'learners-transfers-in', label: 'Transfers In', path: 'learners-transfers-in', permission: 'CREATE_LEARNER' },
        { id: 'learners-exited', label: 'Exited Students', path: 'learners-exited', permission: 'VIEW_ALL_LEARNERS' },
        { id: 'learners-promotion', label: 'Promotion', path: 'learners-promotion', permission: 'PROMOTE_LEARNER' },
        { id: 'learners-transfer-out', label: 'Transfer Out', path: 'learners-transfer-out', permission: 'TRANSFER_LEARNER' }
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
        { id: 'assess-formative', label: 'Formative Assessment', path: 'assess-formative', permission: 'ACCESS_ASSESSMENT_MODULE' },
        { id: 'assess-formative-report', label: 'Formative Report', path: 'assess-formative-report', permission: 'ACCESS_ASSESSMENT_MODULE' },
        { id: 'assess-summative-tests', label: 'Summative Tests', path: 'assess-summative-tests', permission: 'ACCESS_ASSESSMENT_MODULE' },
        { id: 'assess-summative-assessment', label: 'Summative Assessment', path: 'assess-summative-assessment', permission: 'ACCESS_ASSESSMENT_MODULE' },
        { id: 'assess-summative-report', label: 'Summative Report', path: 'assess-summative-report', permission: 'ACCESS_ASSESSMENT_MODULE' },
        { id: 'assess-termly-report', label: 'Termly Report', path: 'assess-termly-report', permission: 'ACCESS_ASSESSMENT_MODULE' },
        { id: 'assess-performance-scale', label: 'Performance Scale', path: 'assess-performance-scale', permission: 'ACCESS_ASSESSMENT_MODULE' }
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
        { id: 'settings-users', label: 'User Management', path: 'settings-users', permission: 'EDIT_USER' },
        { id: 'settings-branding', label: 'Branding', path: 'settings-branding', permission: 'BRANDING_SETTINGS' },
        { id: 'settings-backup', label: 'Backup & Restore', path: 'settings-backup', permission: 'BACKUP_SETTINGS' }
      ]
    }
  ];

  // Filter navigation sections based on user permissions AND focus modules
  const navSections = useMemo(() => {
    return allNavSections
      .filter(section => {
        // First check if this section is in our focus modules
        if (!focusModules.includes(section.id)) {
          return false; // Hide non-focus modules
        }
        
        // If section has permission requirement, check it
        if (section.permission) {
          return can(section.permission);
        }
        // If no permission required on section, check if any items are visible
        if (section.items.length > 0) {
          const visibleItems = section.items.filter(item => 
            !item.permission || can(item.permission)
          );
          return visibleItems.length > 0;
        }
        // Section with no items and no permission - always visible
        return true;
      })
      .map(section => ({
        ...section,
        items: section.items.filter(item => 
          !item.permission || can(item.permission)
        )
      }));
  }, [can]);

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo/Brand */}
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <img 
            src={brandingSettings?.logoUrl || '/logo-zawadi.png'} 
            alt="School Logo" 
            className="w-10 h-10 object-contain" 
            onError={(e) => { e.target.src = '/logo-zawadi.png'; }}
          />
          {sidebarOpen && (
            <span className="font-bold text-lg">
              {brandingSettings?.schoolName || 'Zawadi JRN'}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navSections.map((section) => (
          <div key={section.id}>
            {section.items.length > 0 ? (
              <>
                <button 
                  onClick={() => toggleSection(section.id)} 
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                    section.id === 'assessment' 
                      ? (expandedSections[section.id] ? 'bg-yellow-600 text-gray-900 font-bold shadow-lg' : 'bg-yellow-500 text-gray-900 font-bold hover:bg-yellow-600 shadow-md')
                      : (expandedSections[section.id] ? 'bg-blue-700' : 'text-blue-100 hover:bg-blue-700')
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <section.icon size={20} className={section.id === 'assessment' ? 'text-gray-900' : ''} />
                    {sidebarOpen && <span className={`text-sm font-semibold ${section.id === 'assessment' ? 'text-gray-900' : ''}`}>{section.label}</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={16} 
                      className={`transition ${expandedSections[section.id] ? 'rotate-180' : ''} ${section.id === 'assessment' ? 'text-gray-900' : ''}`} 
                    />
                  )}
                </button>
                {expandedSections[section.id] && sidebarOpen && (
                  <div className="ml-4 space-y-1 mt-1">
                    {section.items.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => item.comingSoon ? null : onNavigate(item.path)} 
                        className={`w-full text-left px-3 py-2 rounded text-xs transition flex items-center justify-between ${
                          item.comingSoon
                            ? 'text-blue-300 cursor-not-allowed opacity-60'
                            : section.id === 'assessment'
                              ? (currentPage === item.path 
                                  ? 'bg-yellow-600 text-gray-900 font-bold shadow-md' 
                                  : 'bg-yellow-500/20 text-yellow-100 hover:bg-yellow-500/30 border border-yellow-500/30')
                              : (currentPage === item.path 
                                  ? 'bg-blue-500 text-white font-semibold' 
                                  : 'text-blue-100 hover:bg-blue-700')
                        }`}
                        disabled={item.comingSoon}
                      >
                        <span>{item.label}</span>
                        {item.comingSoon && (
                          <span className="text-[10px] bg-yellow-500 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                            Soon
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => onNavigate(section.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentPage === section.id 
                    ? 'bg-blue-500' 
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <section.icon size={20} />
                {sidebarOpen && <span className="text-sm font-semibold">{section.label}</span>}
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="p-4 border-t border-blue-700 hover:bg-blue-700 transition"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
};

export default Sidebar;
