import React, { useState } from 'react';
import {
    Home,
    Users,
    BarChart3,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronRight,
    MessageSquare,
    FolderOpen,
    BookOpen,
    Building2
} from 'lucide-react';
import MobileNavigation from './MobileNavigation';
import MobileHeader from './MobileHeader';

/**
 * Mobile App Shell
 * Top-level mobile container with header, navigation, and content area
 * Replaces sidebar with bottom navigation on mobile devices
 */
const MobileAppShell = ({ user, onLogout, onNavigate, currentPage, children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Mobile navigation items organized by category
    const mobileNavItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Home,
            page: 'dashboard',
            category: 'main'
        },
        {
            id: 'students',
            label: 'Students',
            icon: Users,
            page: 'learners-list',
            category: 'learners'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            page: 'assess-summative-assessment',
            category: 'assessment'
        },
        {
            id: 'attendance',
            label: 'Attendance',
            icon: BookOpen,
            page: 'attendance-daily',
            category: 'attendance'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            page: 'settings-school',
            category: 'settings'
        }
    ];

    const handleNavigation = (page) => {
        onNavigate(page);
        setMobileMenuOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col md:hidden">
            {/* Top Header */}
            <MobileHeader
                user={user}
                onLogout={onLogout}
                onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                menuOpen={mobileMenuOpen}
            />

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Render the original children but without sidebar/header */}
                <div className="p-4">
                    {children}
                </div>
            </div>

            {/* Bottom Navigation */}
            <MobileNavigation
                items={mobileNavItems}
                currentPage={currentPage}
                onNavigate={handleNavigation}
            />

            {/* Mobile Menu Drawer (when menu icon clicked) */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 top-14 bg-black/20 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute top-14 left-0 right-0 bg-white shadow-lg z-50">
                        <nav className="space-y-1 p-4">
                            {/* Quick Actions */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 px-4 mb-2 uppercase tracking-wide">Quick Actions</p>
                                <button
                                    onClick={() => handleNavigation('learners-list')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 rounded transition-colors"
                                >
                                    <Users size={18} className="text-blue-600" />
                                    <span className="text-sm font-medium">Manage Students</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('attendance-daily')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 rounded transition-colors"
                                >
                                    <BookOpen size={18} className="text-green-600" />
                                    <span className="text-sm font-medium">Mark Attendance</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('assess-summative-assessment')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 rounded transition-colors"
                                >
                                    <BarChart3 size={18} className="text-purple-600" />
                                    <span className="text-sm font-medium">View Analytics</span>
                                </button>
                            </div>

                            {/* Other Sections */}
                            <div>
                                <p className="text-xs font-semibold text-gray-600 px-4 mb-2 uppercase tracking-wide">More Options</p>
                                <button
                                    onClick={() => handleNavigation('comm-messages')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 rounded transition-colors"
                                >
                                    <MessageSquare size={18} className="text-blue-600" />
                                    <span className="text-sm font-medium">Messages</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('docs-center')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 rounded transition-colors"
                                >
                                    <FolderOpen size={18} className="text-orange-600" />
                                    <span className="text-sm font-medium">Documents</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('help')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 rounded transition-colors"
                                >
                                    <Building2 size={18} className="text-gray-600" />
                                    <span className="text-sm font-medium">Support</span>
                                </button>
                            </div>

                            {/* Logout */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-red-50 active:bg-red-100 flex items-center gap-3 rounded transition-colors text-red-600"
                                >
                                    <LogOut size={18} />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileAppShell;
