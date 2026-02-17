import React from 'react';

/**
 * Mobile Navigation
 * Bottom tab bar for mobile navigation
 * Shows 5 main navigation items in a fixed bottom bar
 */
const MobileNavigation = ({ items, currentPage, onNavigate }) => {
    // Filter to show only main navigation items (top 5)
    const mainItems = items.slice(0, 5);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-bottom md:hidden z-40">
            <nav className="flex justify-around items-stretch h-20">
                {mainItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page || 
                                   (item.category && currentPage.startsWith(item.category));

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.page)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2 transition-all active:bg-gray-50 ${
                                isActive
                                    ? 'text-[#520050]'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2 : 1.5}
                                fill={isActive ? 'currentColor' : 'none'}
                            />
                            <span className={`text-xs font-medium text-center truncate ${
                                isActive ? 'font-bold' : ''
                            }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default MobileNavigation;
