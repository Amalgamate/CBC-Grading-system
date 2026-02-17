import React, { useState, useEffect } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import MobileAppShell from './layout/MobileAppShell';

/**
 * Global Mobile Layout Wrapper
 * Wraps CBCGradingSystem and provides mobile/desktop responsive experience
 * Applies to entire app when screen < 768px
 */
const GlobalMobileLayout = ({ children, user, onLogout, currentPage, onNavigate }) => {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    if (isMobile) {
        return (
            <MobileAppShell
                user={user}
                onLogout={onLogout}
                onNavigate={onNavigate}
                currentPage={currentPage}
                children={children}
            />
        );
    }

    // Desktop layout - return children as-is
    return children;
};

export default GlobalMobileLayout;
