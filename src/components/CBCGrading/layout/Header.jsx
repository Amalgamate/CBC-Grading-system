/**
 * Header Component
 * Top navigation bar with user info, quick actions, and notifications
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Zap, ChevronDown, ClipboardList, BarChart3, MessageSquare, Calendar } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';

const Header = ({ user, onLogout, brandingSettings, title }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const dropdownRef = useRef(null);
  const { role } = usePermissions();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Define quick actions based on role
  const getQuickActions = () => {
    const teacherActions = [
      { icon: ClipboardList, label: 'Create Assessment', action: () => console.log('Create Assessment') },
      { icon: Calendar, label: 'Mark Attendance', action: () => console.log('Mark Attendance') },
      { icon: BarChart3, label: 'View Reports', action: () => console.log('View Reports') },
      { icon: MessageSquare, label: 'Send Message', action: () => console.log('Send Message') },
    ];

    const adminActions = [
      { icon: ClipboardList, label: 'Add Student', action: () => console.log('Add Student') },
      { icon: Calendar, label: 'View Attendance', action: () => console.log('View Attendance') },
      { icon: BarChart3, label: 'Generate Reports', action: () => console.log('Generate Reports') },
      { icon: MessageSquare, label: 'Send Notice', action: () => console.log('Send Notice') },
    ];

    // Return actions based on role
    if (role === 'TEACHER') return teacherActions;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'HEAD_TEACHER') return adminActions;
    
    return teacherActions; // Default
  };

  const quickActions = getQuickActions();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text">
          {title || brandingSettings?.schoolName || 'Zawadi JRN Academy'}
        </h1>
        <p className="text-xs text-gray-600">
          {title ? (brandingSettings?.schoolName || 'Zawadi JRN Academy') : 'CBC Assessment & Grading System'}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Quick Actions Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Zap size={18} className="text-blue-600" />
            <span>Quick Actions</span>
            <ChevronDown size={16} className={`transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <action.icon size={16} className="text-gray-500" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* User Info */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-600">{user?.role || 'System Admin'}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {(user?.name || 'AU').substring(0, 2).toUpperCase()}
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
