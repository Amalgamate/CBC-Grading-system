import React, { useState } from 'react';
import {
    Home,
    Users,
    BarChart3,
    Settings,
    Menu,
    X,
    Bell,
    Search,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Calendar,
    Clock
} from 'lucide-react';

/**
 * Mobile Dashboard Component
 * App-like interface for mobile devices with bottom navigation
 * Hides sidebar, optimized for touch and small screens
 */
const MobileDashboard = ({ onNavigate = () => {}, currentPage, metrics = {} }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [showSearch, setShowSearch] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const schoolName = 'Elimcrown School';

    // Quick actions for home tab
    const quickActions = [
        { icon: CheckCircle2, label: 'Mark Attendance', path: 'attendance-daily', color: 'bg-blue-500' },
        { icon: BarChart3, label: 'View Analytics', path: 'assess-summative-assessment', color: 'bg-purple-500' },
        { icon: Users, label: 'Students', path: 'learners-list', color: 'bg-green-500' },
        { icon: Calendar, label: 'Timetable', path: 'planner-timetable', color: 'bg-orange-500' }
    ];

    // Dashboard stats
    const dashboardStats = [
        { label: 'Active Learners', value: metrics?.activeLearnersValue || '330', change: metrics?.activeLearnersChange || '+2.5%', trend: 'up', icon: Users },
        { label: 'Assessments Today', value: metrics?.assessmentsValue || '12', change: metrics?.assessmentsChange || '+5', trend: 'up', icon: BarChart3 },
        { label: 'Attendance Rate', value: metrics?.attendanceValue || '92%', change: metrics?.attendanceChange || '+3%', trend: 'up', icon: CheckCircle2 }
    ];

    const handleNavigation = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
    };

    const renderHomeContent = () => (
        <div className="pb-24 space-y-6">
            {/* Stats Overview */}
            <div className="px-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-600">Today's Overview</h3>
                {dashboardStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">{stat.label}</p>
                                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                                <ArrowUpRight size={14} />
                                {stat.change}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="px-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-600">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={i}
                                onClick={() => handleNavigation(action.path)}
                                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 active:bg-gray-50 transition-all space-y-2"
                            >
                                <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mx-auto`}>
                                    <Icon size={20} />
                                </div>
                                <p className="text-xs font-medium text-gray-900 text-center">{action.label}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="px-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-600">Recent Activity</h3>
                <div className="space-y-2">
                    {[
                        { title: 'Attendance marked for Grade 5A', time: '2 hours ago', icon: CheckCircle2, type: 'success' },
                        { title: 'New assignment added', time: '5 hours ago', icon: AlertCircle, type: 'info' },
                        { title: 'Student enrollment completed', time: 'Yesterday', icon: Users, type: 'success' }
                    ].map((activity, i) => {
                        const Icon = activity.icon;
                        return (
                            <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 flex items-start gap-3">
                                <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                                    activity.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderAnalyticsContent = () => (
        <div className="pb-24 px-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            
            <div className="space-y-4">
                {[
                    { title: 'Learner Performance', desc: '12 assessments completed', value: '85%' },
                    { title: 'Class Participation', desc: 'Average engagement score', value: '78%' },
                    { title: 'Assignment Completion', desc: 'Submitted this week', value: '92%' }
                ].map((metric, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{metric.title}</h3>
                            <span className="text-lg font-bold text-blue-600">{metric.value}</span>
                        </div>
                        <p className="text-xs text-gray-600">{metric.desc}</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: metric.value }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStudentsContent = () => (
        <div className="pb-24 px-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Students</h2>
            
            <div className="space-y-3">
                {[
                    { name: 'Alice Kipchoge', class: 'Grade 5A', status: 'Present' },
                    { name: 'Benjamin Kamau', class: 'Grade 5A', status: 'Present' },
                    { name: 'Cynthia Omondi', class: 'Grade 5A', status: 'Absent' },
                    { name: 'David Maina', class: 'Grade 5A', status: 'Present' }
                ].map((student, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-600">{student.class}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            student.status === 'Present' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {student.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSettingsContent = () => (
        <div className="pb-24 px-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            
            <div className="space-y-2">
                {[
                    { icon: Bell, label: 'Notifications', desc: 'Manage alerts' },
                    { icon: Users, label: 'Profile', desc: 'Edit your profile' },
                    { icon: Clock, label: 'Preferences', desc: 'App preferences' },
                    { icon: BarChart3, label: 'Report Issue', desc: 'Contact support' }
                ].map((setting, i) => {
                    const Icon = setting.icon;
                    return (
                        <button
                            key={i}
                            className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 active:bg-gray-50 text-left flex items-center gap-3"
                        >
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                                <p className="text-xs text-gray-600">{setting.desc}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-white md:bg-gray-50 overflow-hidden flex flex-col">
            {/* Top App Bar */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                    <p className="text-xs text-gray-600">{schoolName}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
                    >
                        <Search size={20} className="text-gray-600" />
                    </button>
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
                    >
                        {showMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Search Bar (conditional) */}
            {showSearch && (
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        autoFocus 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'home' && renderHomeContent()}
                {activeTab === 'analytics' && renderAnalyticsContent()}
                {activeTab === 'students' && renderStudentsContent()}
                {activeTab === 'settings' && renderSettingsContent()}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-2 py-2 flex justify-around">
                {[
                    { id: 'home', icon: Home, label: 'Home' },
                    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                    { id: 'students', icon: Users, label: 'Students' },
                    { id: 'settings', icon: Settings, label: 'Settings' }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all active:bg-gray-200 ${
                                activeTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-gray-600'
                            }`}
                        >
                            <Icon size={24} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileDashboard;
