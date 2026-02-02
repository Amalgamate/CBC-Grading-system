/**
 * Teacher Dashboard - Compact & Clean Design with Drag & Drop
 * Minimal, efficient dashboard view for TEACHER role
 * Users can rearrange dashboard sections by dragging
 */

import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../../../services/api';
import {
  Users,
  ClipboardList,
  BookOpen,
  Clock,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  GripVertical
} from 'lucide-react';
import AnimatedDoughnutChart from '../../shared/AnimatedDoughnutChart';

const TeacherDashboard = ({ learners, user }) => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getTeacherMetrics();
        if (response.success) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error('Failed to load teacher metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [user]);

  const myStudents = metrics?.stats?.myStudents || learners?.filter(l => l.status === 'Active').length || 0;

  const todayClasses = metrics?.schedule || [];

  const pendingTasks = [
    { id: 1, task: 'Ungraded Assessments', count: metrics?.stats?.pendingTasks || 0, priority: 'high' }
  ].filter(t => t.count > 0);

  // Dashboard sections configuration
  const defaultSections = [
    { id: 'stats', type: 'stats', order: 1 },
    { id: 'schedule', type: 'schedule', order: 2 },
    { id: 'tasks', type: 'tasks', order: 3 },
    { id: 'activity', type: 'activity', order: 4 },
    { id: 'analytics', type: 'analytics', order: 5 }
  ];

  // Load saved layout from localStorage or use default
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('teacherDashboardLayout');
    return saved ? JSON.parse(saved) : defaultSections;
  });

  const [draggedItem, setDraggedItem] = useState(null);

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('teacherDashboardLayout', JSON.stringify(sections));
  }, [sections]);

  const handleDragStart = (e, section) => {
    setDraggedItem(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetSection.id) {
      return;
    }

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedItem.id);
    const targetIndex = newSections.findIndex(s => s.id === targetSection.id);

    // Remove dragged item and insert at target position
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);

    // Update order
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));

    setSections(updatedSections);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Render individual sections
  const renderSection = (section) => {
    const isDragging = draggedItem?.id === section.id;

    switch (section.type) {
      case 'stats':
        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="relative group">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {/* Students Card - Blue */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-blue-700 font-medium">Students</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{myStudents}</p>
                  <p className="text-xs text-blue-600 mt-1">Active learners</p>
                </div>

                {/* Classes Card - Green */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-green-700 font-medium">Classes</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{todayClasses.length}</p>
                  <p className="text-xs text-green-600 mt-1">Today's schedule</p>
                </div>

                {/* Tasks Card - Orange */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-orange-700 font-medium">Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{pendingTasks.length}</p>
                  <p className="text-xs text-orange-600 mt-1">Pending items</p>
                </div>

                {/* Messages Card - Purple */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-purple-700 font-medium">Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{metrics?.stats?.messages || 0}</p>
                  <p className="text-xs text-purple-600 mt-1">Inbox cleared</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="relative group">
              <div className="absolute -left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">Today's Schedule</h3>
                  <span className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="p-3 space-y-2">
                  {todayClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-1 h-12 rounded-full ${classItem.status === 'next' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-900">{classItem.grade}</p>
                            <span className="text-xs text-gray-500">•</span>
                            <p className="text-sm text-gray-600">{classItem.subject}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {classItem.time}
                            </span>
                            <span className="text-xs text-gray-500">Room {classItem.room}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          Attendance
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors">
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="relative group">
              <div className="absolute -left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm">Pending Tasks</h3>
                </div>

                <div className="p-3 space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer group"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                      <p className="text-xs text-gray-700 group-hover:text-gray-900 flex-1">{task.task} ({task.count})</p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="relative group">
              <div className="absolute -left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
                </div>

                <div className="p-3 space-y-2">
                  {metrics?.recentActivity?.length > 0 ? (
                    metrics.recentActivity.map((act) => (
                      <div key={act.id} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${act.type === 'assessment' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-700">{act.text}</p>
                          <span className="text-xs text-gray-400">{new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center text-gray-400 py-4 italic">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="relative group">
              <div className="absolute -left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Performance Overview
                  </h3>
                  <span className="text-xs text-gray-500">This Week</span>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-4 gap-6">
                    <AnimatedDoughnutChart
                      percentage={metrics?.stats?.analytics?.attendance || 0}
                      size={110}
                      strokeWidth={8}
                      color="#3b82f6"
                      label="Attendance"
                      sublabel="Avg Rate"
                    />

                    <AnimatedDoughnutChart
                      percentage={metrics?.stats?.analytics?.graded || 0}
                      size={110}
                      strokeWidth={8}
                      color="#10b981"
                      label="Graded"
                      sublabel="Assessments"
                    />

                    <AnimatedDoughnutChart
                      percentage={metrics?.stats?.analytics?.completion || 0}
                      size={110}
                      strokeWidth={8}
                      color="#f59e0b"
                      label="Completion"
                      sublabel="Course progress"
                    />

                    <AnimatedDoughnutChart
                      percentage={metrics?.stats?.analytics?.engagement || 0}
                      size={110}
                      strokeWidth={8}
                      color="#8b5cf6"
                      label="Engagement"
                      sublabel="Participation"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Compact Status Bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">Summary:</span> {todayClasses.length} assigned classes • {metrics?.stats?.pendingTasks || 0} pending tasks
        </p>
        <div className="text-right">
          <p className="text-xs text-gray-500">Live Status: <span className="font-semibold text-green-600">Online</span></p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-blue-600" />
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Tip:</span> Hover over sections and drag the grip icon to rearrange your dashboard
        </p>
      </div>

      {/* Draggable Sections */}
      {sortedSections.map(section => renderSection(section))}
    </div>
  );
};

export default TeacherDashboard;
