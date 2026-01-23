/**
 * Super Admin Dashboard
 * Full system overview with all metrics and controls
 */

import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, BarChart3, Database, AlertCircle } from 'lucide-react';
import StatsCard from '../../shared/StatsCard';
import LoadingSpinner from '../../shared/LoadingSpinner';
import api from '../../../../services/api';

const SuperAdminDashboard = ({ learners, teachers }) => {
  const [stats, setStats] = useState(null);
  const [learnerStats, setLearnerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch both user stats and learner stats
        const [userResponse, learnerResponse] = await Promise.all([
          api.users.getStats(),
          api.learners.getStats()
        ]);
        
        if (userResponse.success) {
          setStats(userResponse.data);
        }
        
        if (learnerResponse.success) {
          setLearnerStats(learnerResponse.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate stats from props and API
  const activeLearners = learnerStats?.active || learners?.filter(l => l.status === 'ACTIVE').length || 0;
  const totalLearners = learnerStats?.total || learners?.length || 0;
  const activeTeachers = teachers?.filter(t => t.status === 'ACTIVE').length || 0;
  
  // Get stats from API
  const totalUsers = stats?.totalUsers || 0;
  const superAdmins = stats?.usersByRole?.SUPER_ADMIN || 0;
  const admins = stats?.usersByRole?.ADMIN || 0;
  const headTeachers = stats?.usersByRole?.HEAD_TEACHER || 0;
  const teachersCount = stats?.usersByRole?.TEACHER || 0;
  const parents = stats?.usersByRole?.PARENT || 0;
  const accountants = stats?.usersByRole?.ACCOUNTANT || 0;
  const receptionists = stats?.usersByRole?.RECEPTIONIST || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-bold">Error Loading Dashboard</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={totalUsers} 
          icon={Users} 
          color="blue" 
          subtitle="All system users" 
        />
        <StatsCard 
          title="Active Learners" 
          value={activeLearners} 
          icon={GraduationCap} 
          color="green" 
          subtitle="Enrolled students" 
        />
        <StatsCard 
          title="Teachers" 
          value={teachersCount} 
          icon={GraduationCap} 
          color="purple" 
          subtitle="Teaching staff" 
        />
        <StatsCard 
          title="Parents" 
          value={parents} 
          icon={Users} 
          color="orange" 
          subtitle="Parent accounts" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users size={20} />
            User Distribution by Role
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
              <span className="text-gray-700 font-medium">Super Admins</span>
              <span className="font-bold text-indigo-600">{superAdmins}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-gray-700 font-medium">Admins</span>
              <span className="font-bold text-blue-600">{admins}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700 font-medium">Head Teachers</span>
              <span className="font-bold text-green-600">{headTeachers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-teal-50 rounded">
              <span className="text-gray-700 font-medium">Teachers</span>
              <span className="font-bold text-teal-600">{teachersCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="text-gray-700 font-medium">Parents</span>
              <span className="font-bold text-purple-600">{parents}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span className="text-gray-700 font-medium">Accountants</span>
              <span className="font-bold text-orange-600">{accountants}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded">
              <span className="text-gray-700 font-medium">Receptionists</span>
              <span className="font-bold text-pink-600">{receptionists}</span>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Database size={20} />
            System Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">Total Users</span>
              <span className="font-bold text-gray-900">{totalUsers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">Total Learners</span>
              <span className="font-bold text-gray-900">{totalLearners}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">Active Learners</span>
              <span className="font-bold text-gray-900">{activeLearners}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">Active Teachers</span>
              <span className="font-bold text-gray-900">{activeTeachers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700 font-medium">System Status</span>
              <span className="font-bold text-green-600">Operational</span>
            </div>
          </div>
        </div>

        {/* Learner Statistics by Grade */}
        {learnerStats?.byGrade && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GraduationCap size={20} />
              Learners by Grade
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(learnerStats.byGrade).map(([grade, count]) => (
                <div key={grade} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-700 font-medium">{grade.replace('_', ' ')}</span>
                  <span className="font-bold text-blue-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
              <Users className="mx-auto mb-2 text-blue-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
              <BookOpen className="mx-auto mb-2 text-green-600" size={24} />
              <span className="text-sm font-medium text-gray-700">System Settings</span>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <Database className="mx-auto mb-2 text-purple-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Backup</span>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
              <BarChart3 className="mx-auto mb-2 text-orange-600" size={24} />
              <span className="text-sm font-medium text-gray-700">View Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
