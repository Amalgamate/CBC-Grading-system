/**
 * Sidebar Component
 * Navigation sidebar with collapsible sections
 */

import React from 'react';
import { 
  Menu, X, Home, Users, Settings, BookOpen, Clock, 
  BarChart3, ChevronDown, GraduationCap, ClipboardList, Megaphone, UserPlus, HelpCircle 
} from 'lucide-react';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentPage, 
  onNavigate,
  expandedSections,
  toggleSection,
  brandingSettings
}) => {
  const navSections = [
    { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    items: [] 
    },
    { 
    id: 'learners', 
    label: 'Students', 
    icon: Users, 
    items: [
    { id: 'learners-list', label: 'Students List', path: 'learners-list' },
    { id: 'learners-admissions', label: 'Admissions', path: 'learners-admissions' },
    { id: 'learners-transfers-in', label: 'Transfers In', path: 'learners-transfers-in' },
    { id: 'learners-exited', label: 'Exited Students', path: 'learners-exited' },
    { id: 'learners-promotion', label: 'Promotion', path: 'learners-promotion' },
    { id: 'learners-transfer-out', label: 'Transfer Out', path: 'learners-transfer-out' }
    ]
    },
    { 
    id: 'teachers', 
    label: 'Tutors', 
    icon: GraduationCap, 
    items: [
    { id: 'teachers-list', label: 'Tutors List', path: 'teachers-list' }
    ]
    },
    { 
      id: 'parents', 
      label: 'Parents', 
      icon: UserPlus, 
      items: [
        { id: 'parents-list', label: 'Parents List', path: 'parents-list' }
      ]
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      icon: ClipboardList, 
      items: [
        { id: 'attendance-daily', label: 'Daily Attendance', path: 'attendance-daily' },
        { id: 'attendance-reports', label: 'Attendance Reports', path: 'attendance-reports' }
      ]
    },
    { 
      id: 'communications', 
      label: 'Communications', 
      icon: Megaphone, 
      items: [
        { id: 'comm-notices', label: 'Notices & Announcements', path: 'comm-notices' },
        { id: 'comm-messages', label: 'Messages', path: 'comm-messages' }
      ]
    },
    { 
      id: 'assessment', 
      label: 'Assessment', 
      icon: BarChart3, 
      items: [
        { id: 'assess-formative', label: 'Formative Assessment', path: 'assess-formative' },
        { id: 'assess-formative-report', label: 'Formative Report', path: 'assess-formative-report' },
        { id: 'assess-summative-tests', label: 'Summative Tests', path: 'assess-summative-tests' },
        { id: 'assess-summative-assessment', label: 'Summative Assessment', path: 'assess-summative-assessment' },
        { id: 'assess-summative-report', label: 'Summative Report', path: 'assess-summative-report' },
        { id: 'assess-termly-report', label: 'Termly Report', path: 'assess-termly-report' },
        { id: 'assess-performance-scale', label: 'Performance Scale', path: 'assess-performance-scale' }
      ]
    },
    { 
      id: 'help', 
      label: 'Help & Support', 
      icon: HelpCircle, 
      items: []
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      items: [
        { id: 'settings-school', label: 'School Settings', path: 'settings-school' },
        { id: 'settings-academic', label: 'Academic Settings', path: 'settings-academic' },
        { id: 'settings-users', label: 'User Management', path: 'settings-users' },
        { id: 'settings-branding', label: 'Branding', path: 'settings-branding' },
        { id: 'settings-backup', label: 'Backup & Restore', path: 'settings-backup' }
      ]
    }
  ];

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
                    expandedSections[section.id] ? 'bg-blue-700' : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <section.icon size={20} />
                    {sidebarOpen && <span className="text-sm font-semibold">{section.label}</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={16} 
                      className={`transition ${expandedSections[section.id] ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>
                {expandedSections[section.id] && sidebarOpen && (
                  <div className="ml-4 space-y-1 mt-1">
                    {section.items.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => onNavigate(item.path)} 
                        className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                          currentPage === item.path 
                            ? 'bg-blue-500 text-white font-semibold' 
                            : 'text-blue-100 hover:bg-blue-700'
                        }`}
                      >
                        {item.label}
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
