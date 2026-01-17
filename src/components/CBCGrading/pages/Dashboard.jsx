/**
 * Dashboard Page
 * Main dashboard with statistics and overview
 */

import React from 'react';
import { Users, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';
import StatsCard from '../shared/StatsCard';

const Dashboard = ({ learners, teachers }) => {
  const activeLearners = learners?.filter(l => l.status === 'Active').length || 0;
  const activeTeachers = teachers?.filter(t => t.status === 'Active').length || 0;
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Active Students"
          value={activeLearners}
          icon={Users}
          color="blue"
          subtitle="Currently enrolled"
        />
        <StatsCard
          title="Active Tutors"
          value={activeTeachers}
          icon={GraduationCap}
          color="green"
          subtitle="Teaching staff"
        />
        <StatsCard
          title="Classes"
          value="12"
          icon={BookOpen}
          color="purple"
          subtitle="Active classes"
        />
        <StatsCard
          title="Avg Attendance"
          value="89%"
          icon={BarChart3}
          color="orange"
          subtitle="This term"
        />
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Welcome to Zawadi JRN Academy</h3>
        <p className="text-gray-600 mb-4">
          Your comprehensive CBC assessment and grading system. Use the navigation menu to access different modules.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📚 Student Management</h4>
            <p className="text-sm text-blue-700">
              Manage student records, admissions, promotions, and transfers
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">📊 Assessment</h4>
            <p className="text-sm text-green-700">
              Record formative and summative assessments using CBC rubric
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">📋 Attendance</h4>
            <p className="text-sm text-purple-700">
              Track daily attendance and generate comprehensive reports
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">System Update:</span> New features added to assessment module
            </p>
            <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Attendance:</span> Grade 3A attendance marked for today
            </p>
            <span className="ml-auto text-xs text-gray-500">4 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">New Notice:</span> Parent-teacher meeting scheduled
            </p>
            <span className="ml-auto text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
