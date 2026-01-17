/**
 * Header Component
 * Top navigation bar with user info and notifications
 */

import React from 'react';
import { Bell, LogOut } from 'lucide-react';

const Header = ({ user, onLogout, brandingSettings }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text">
          {brandingSettings?.schoolName || 'Zawadi JRN Academy'}
        </h1>
        <p className="text-xs text-gray-600">CBC Assessment & Grading System</p>
      </div>
      
      <div className="flex items-center gap-6">
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
