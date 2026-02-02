/**
 * Comprehensive Admin Dashboard
 * Modern, intuitive design with data visualizations
 */

import React, { useEffect, useState } from 'react';
import { schoolAPI, dashboardAPI } from '../../../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

// Doughnut Chart Component
const DoughnutChart = ({ data, title, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Start from top

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const radius = size / 2 - 15;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
            const rotation = currentAngle;
            currentAngle += angle;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="30"
                strokeDasharray={strokeDasharray}
                strokeDashoffset="0"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500 uppercase">{title}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2 w-full">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.label}</span>
            </div>
            <span className="font-semibold text-gray-900">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modern Stats Card
const ModernStatsCard = ({ title, value, change, icon: Icon, color, trend, subtitle }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {change}
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm font-semibold text-gray-700 mb-1">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
};

// Quick Action Button
const QuickActionButton = ({ icon: Icon, label, color, onClick }) => {
  const colorClasses = {
    blue: 'hover:bg-blue-50 text-blue-600',
    green: 'hover:bg-green-50 text-green-600',
    purple: 'hover:bg-purple-50 text-purple-600',
    orange: 'hover:bg-orange-50 text-orange-600'
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 ${colorClasses[color]} transition-all hover:border-current hover:shadow-md`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
};

const AdminDashboard = ({ learners = [], pagination, teachers = [], user, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month, term
  const [trialInfo, setTrialInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const loadMetrics = async (filter) => {
    try {
      setRefreshing(true);
      const response = await dashboardAPI.getAdminMetrics(filter || timeFilter);
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const schoolId = user?.school?.id || user?.schoolId || localStorage.getItem('currentSchoolId');
    if (!schoolId) return;

    schoolAPI.getById(schoolId)
      .then(response => {
        const school = response.data;
        if (!school) return;
        const start = school.trialStart ? new Date(school.trialStart) : null;
        const days = school.trialDays || 30;
        let remaining = null;
        if (start) {
          const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
          remaining = Math.max(days - diff, 0);
        }
        setTrialInfo({
          status: school.status || (school.active ? 'ACTIVE' : 'INACTIVE'),
          remainingDays: remaining,
        });
      })
      .catch((err) => console.error('Error fetching school info:', err));

    loadMetrics(timeFilter);
  }, [user, timeFilter]);

  // Use fetched metrics or fall back to properties/defaults
  const stats = {
    totalStudents: metrics?.stats?.totalStudents || pagination?.total || learners.length || 0,
    activeStudents: metrics?.stats?.activeStudents || learners.filter(l => l.status === 'ACTIVE').length || 0,
    totalTeachers: metrics?.stats?.totalTeachers || teachers.length || 0,
    activeTeachers: metrics?.stats?.activeTeachers || teachers.filter(t => t.status === 'ACTIVE').length || 0,
    presentToday: metrics?.stats?.presentToday || 0,
    absentToday: metrics?.stats?.absentToday || 0,
    lateToday: metrics?.stats?.lateToday || 0,
    totalClasses: metrics?.stats?.totalClasses || 0,
    avgAttendance: metrics?.stats?.avgAttendance || 0
  };

  // Student distribution by grade
  const studentsByGrade = metrics?.distributions?.studentsByGrade || [
    { label: 'PP1-PP2', value: 0, color: '#3b82f6' },
    { label: 'Grade 1-3', value: 0, color: '#10b981' },
    { label: 'Grade 4-6', value: 0, color: '#8b5cf6' },
    { label: 'Grade 7-9', value: 0, color: '#f59e0b' }
  ];

  // Attendance overview
  const attendanceData = [
    { label: 'Present', value: stats.presentToday, color: '#10b981' },
    { label: 'Absent', value: stats.absentToday, color: '#ef4444' },
    { label: 'Late', value: stats.lateToday, color: '#f59e0b' }
  ];

  // Staff distribution
  const staffData = metrics?.distributions?.staff || [
    { label: 'Teachers', value: stats.totalTeachers, color: '#3b82f6' },
    { label: 'Admin Staff', value: 0, color: '#8b5cf6' },
    { label: 'Support Staff', value: 0, color: '#06b6d4' }
  ];

  // Assessment overview (still partly mock until we have a proper agg)
  const assessmentData = [
    { label: 'Exceeding', value: metrics?.stats?.performance?.ee || 0, color: '#10b981' },
    { label: 'Meeting', value: metrics?.stats?.performance?.me || 0, color: '#3b82f6' },
    { label: 'Approaching', value: metrics?.stats?.performance?.ae || 0, color: '#f59e0b' },
    { label: 'Below', value: metrics?.stats?.performance?.be || 0, color: '#ef4444' }
  ];

  const handleRefresh = () => {
    loadMetrics();
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {trialInfo && trialInfo.status === 'TRIAL' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-yellow-700" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">
              Trial Active
            </p>
            <p className="text-xs text-yellow-800">
              {typeof trialInfo.remainingDays === 'number'
                ? `${trialInfo.remainingDays} day(s) remaining`
                : 'Trial in progress'}
            </p>
          </div>
        </div>
      )}
      {trialInfo && trialInfo.status === 'INACTIVE' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-700" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              School Inactive
            </p>
            <p className="text-xs text-red-800">
              Trial expired. Please contact Super Admin to approve payment.
            </p>
          </div>
        </div>
      )}
      {/* Compact Actions Toolbar */}
      <div className="flex justify-end gap-3">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="term">This Term</option>
        </select>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
          subtitle={`${stats.activeStudents} active`}
        />

        <ModernStatsCard
          title="Teaching Staff"
          value={stats.totalTeachers}
          icon={GraduationCap}
          color="green"
          subtitle={`${stats.activeTeachers} active`}
        />

        <ModernStatsCard
          title="Attendance"
          value={`${stats.avgAttendance}%`}
          icon={UserCheck}
          color="purple"
          subtitle={`${stats.presentToday}/${stats.totalStudents} present`}
        />

        <ModernStatsCard
          title="Active Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          color="orange"
          subtitle="All grades covered"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Students by Grade */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Students by Grade</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <DoughnutChart
            data={studentsByGrade}
            title="Students"
            size={180}
          />
        </div>

        {/* Attendance Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Today's Attendance</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <DoughnutChart
            data={attendanceData}
            title="Total"
            size={180}
          />
        </div>

        {/* Staff Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Staff Distribution</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <DoughnutChart
            data={staffData}
            title="Staff"
            size={180}
          />
        </div>

        {/* Assessment Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">CBC Performance</h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <DoughnutChart
            data={assessmentData}
            title="Students"
            size={180}
          />
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton
              icon={Users}
              label="Add Student"
              color="blue"
              onClick={() => onNavigate('learners-admissions')}
            />
            <QuickActionButton
              icon={GraduationCap}
              label="Add Teacher"
              color="green"
              onClick={() => onNavigate('teachers-list')}
            />
            <QuickActionButton
              icon={BookOpen}
              label="New Class"
              color="purple"
              onClick={() => onNavigate('settings-academic')}
            />
            <QuickActionButton
              icon={Download}
              label="Reports"
              color="orange"
              onClick={() => onNavigate('assess-summative-report')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {metrics?.recentActivity?.admissions?.length > 0 ? (
              metrics.recentActivity.admissions.map((student, idx) => (
                <div key={`adm-${idx}`} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">New Student Admitted</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {student.firstName} {student.lastName} - {student.grade.replace('_', ' ')} • {student.admissionNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(student.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : metrics?.recentActivity?.assessments?.length > 0 ? (
              metrics.recentActivity.assessments.map((assessment, idx) => (
                <div key={`as-${idx}`} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{assessment.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {assessment.learningArea} • {assessment.learner.firstName} {assessment.learner.lastName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(assessment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 italic">No recent activity found</div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Classes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Classes</h3>
          <div className="space-y-3">
            {(metrics?.topPerformingClasses || [
              { grade: 'Grade 6A', avg: 92, students: 30, color: 'blue' },
              { grade: 'Grade 5B', avg: 89, students: 28, color: 'green' },
              { grade: 'Grade 4A', avg: 87, students: 32, color: 'purple' },
              { grade: 'Grade 3B', avg: 85, students: 29, color: 'orange' }
            ]).map((cls, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center`}>
                    <span className={`text-blue-600 font-bold text-sm`}>
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cls.grade}</p>
                    <p className="text-xs text-gray-500">{cls.students} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{cls.avg}%</p>
                  <p className="text-xs text-gray-500">Average</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {(metrics?.upcomingEvents || [
              {
                title: 'Parent-Teacher Meeting',
                date: 'Feb 15, 2026',
                time: '2:00 PM',
                type: 'meeting',
                color: 'blue'
              },
              {
                title: 'End of Term Exams',
                date: 'Mar 1-5, 2026',
                time: 'All Week',
                type: 'exam',
                color: 'purple'
              }
            ]).map((event, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200`}>
                <div className={`bg-blue-100 p-2 rounded-lg`}>
                  <Calendar className={`w-5 h-5 text-blue-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-600">{event.date}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-600">{event.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
