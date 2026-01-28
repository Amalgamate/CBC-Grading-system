// ============================================
// INTEGRATION GUIDE: Performance Scales
// ============================================

/**
 * This guide shows how to integrate the Performance Scales component
 * into your admin dashboard or settings page.
 */

// ============================================
// Option 1: Add to Admin Dashboard
// ============================================

// In your admin dashboard router (e.g., src/App.jsx or admin routes):

import PerformanceScales from './components/EDucore/admin/PerformanceScales';

// Add route:
<Route path="/admin/performance-scales" element={<PerformanceScales />} />

// Or in your settings menu:
<Route path="/settings/grading" element={<PerformanceScales />} />

// ============================================
// Option 2: Add to Settings Page
// ============================================

// If you have a Settings component with tabs:

import PerformanceScales from './components/EDucore/admin/PerformanceScales';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <div>
      <nav className="flex gap-4 border-b">
        <button onClick={() => setActiveTab('general')}>General</button>
        <button onClick={() => setActiveTab('grading')}>Performance Scales</button>
        {/* other tabs */}
      </nav>
      
      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'grading' && <PerformanceScales />}
    </div>
  );
};

// ============================================
// Option 3: Navigation Menu Integration
// ============================================

// In your sidebar or navigation component:

const navigationItems = [
  // ... other items
  {
    name: 'Performance Scales',
    path: '/admin/performance-scales',
    icon: BarChart2, // from lucide-react
    roles: ['ADMIN', 'HEAD_TEACHER']
  }
];

// ============================================
// Required Context
// ============================================

/**
 * The PerformanceScales component requires:
 * 
 * 1. AuthContext with user object containing:
 *    - user.schoolId: Current school ID
 *    - user.role: User role for permissions
 * 
 * 2. API configuration with:
 *    - Base URL set in .env as REACT_APP_API_URL
 *    - Authentication token in localStorage
 *    - School ID header (X-School-Id)
 * 
 * Example AuthContext usage:
 */

import { useAuth } from './contexts/AuthContext';

const Component = () => {
  const { user } = useAuth();
  
  // user.schoolId is automatically used by the service
  // user.role can be used for permission checks
  
  return <PerformanceScales />;
};

// ============================================
// Permission Checks (Optional)
// ============================================

// Wrap the route with permission check if needed:

import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute 
  path="/admin/performance-scales" 
  element={<PerformanceScales />}
  allowedRoles={['ADMIN', 'HEAD_TEACHER']}
/>

// ============================================
// Breadcrumb Integration
// ============================================

// If you use breadcrumbs:

const breadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings', href: '/settings' },
  { label: 'Performance Scales', href: '/settings/grading' }
];

// ============================================
// Menu Item Example
// ============================================

// Complete sidebar menu item:

import { Scale } from 'lucide-react';

<NavLink 
  to="/admin/performance-scales"
  className={({ isActive }) => 
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-indigo-600 text-white' 
        : 'text-gray-700 hover:bg-gray-100'
    }`
  }
>
  <Scale className="w-5 h-5" />
  <span>Performance Scales</span>
</NavLink>

// ============================================
// Example: Full Integration in Settings Page
// ============================================

import React, { useState } from 'react';
import { Scale, Settings as SettingsIcon, Users, Bell } from 'lucide-react';
import PerformanceScales from '../components/EDucore/admin/PerformanceScales';
import GeneralSettings from '../components/EDucore/admin/Settings';
import UserManagement from '../components/EDucore/admin/UserManagement';
import Notifications from '../components/EDucore/admin/Notifications';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, component: GeneralSettings },
    { id: 'grading', label: 'Performance Scales', icon: Scale, component: PerformanceScales },
    { id: 'users', label: 'Users', icon: Users, component: UserManagement },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: Notifications }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  );
};

export default AdminSettings;

// ============================================
// Environment Variables
// ============================================

/**
 * Ensure your .env file includes:
 * 
 * REACT_APP_API_URL=http://localhost:5000
 * 
 * Or for production:
 * REACT_APP_API_URL=https://api.yourdomain.com
 */

// ============================================
// Testing the Integration
// ============================================

/**
 * 1. Start the backend server:
 *    cd server && npm run dev
 * 
 * 2. Start the frontend:
 *    npm start
 * 
 * 3. Navigate to the Performance Scales page
 * 
 * 4. Test functionality:
 *    - Create a new scale
 *    - Edit existing scale
 *    - Delete a scale
 *    - Duplicate a scale
 *    - Add/remove ranges
 *    - Toggle active status
 *    - Set as default
 * 
 * 5. Check multi-tenant isolation:
 *    - Switch schools (if applicable)
 *    - Verify scales are school-specific
 * 
 * 6. Verify API calls in browser DevTools:
 *    - Check Network tab for API requests
 *    - Verify authentication headers
 *    - Check school ID headers
 */

// ============================================
// Troubleshooting
// ============================================

/**
 * If you encounter issues:
 * 
 * 1. Component not rendering:
 *    - Check import path
 *    - Verify AuthContext is provided
 *    - Check user.schoolId exists
 * 
 * 2. API errors:
 *    - Verify backend is running
 *    - Check REACT_APP_API_URL in .env
 *    - Verify authentication token
 *    - Check browser console for errors
 * 
 * 3. Styles not working:
 *    - Ensure Tailwind CSS is configured
 *    - Check if styles are purged in production
 *    - Verify lucide-react is installed
 * 
 * 4. Permission errors:
 *    - Check user role
 *    - Verify tenant middleware
 *    - Check school ID consistency
 */

// ============================================
// Dependencies Check
// ============================================

/**
 * Required npm packages:
 * 
 * Frontend:
 * - react
 * - react-router-dom
 * - axios
 * - lucide-react
 * - tailwindcss
 * 
 * Backend:
 * - express
 * - @prisma/client
 * - jsonwebtoken (for auth)
 * 
 * Install if missing:
 * npm install lucide-react
 */
