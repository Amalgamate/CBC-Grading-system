import React from 'react';
import { Menu, X, Bell, LogOut } from 'lucide-react';

/**
 * Mobile Header
 * Top app bar with school name, user info, and menu toggle
 */
const MobileHeader = ({ user, onLogout, onMenuToggle, menuOpen }) => {
    const schoolName = user?.school?.name || user?.schoolName || 'School';
    
    return (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-[#520050] to-[#3D0038] text-white px-4 py-3 shadow-md safe-top">
            <div className="flex items-center justify-between gap-3">
                {/* Left: School Name */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold truncate">{schoolName}</h1>
                    <p className="text-xs opacity-75 truncate">{user?.role || 'User'}</p>
                </div>

                {/* Right: Icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Notifications */}
                    <button className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors">
                        <Bell size={20} />
                    </button>

                    {/* Menu Toggle */}
                    <button
                        onClick={onMenuToggle}
                        className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileHeader;
