import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import CBCGradingSystem from './components/CBCGrading/CBCGradingSystem';
import HomePage from './components/ElimcrownWebsite/pages/HomePage';
import FeaturesPage from './components/ElimcrownWebsite/pages/FeaturesPage';
import SolutionsPage from './components/ElimcrownWebsite/pages/SolutionsPage';
import PricingPage from './components/ElimcrownWebsite/pages/PricingPage';
import ContactPage from './components/ElimcrownWebsite/pages/ContactPage';
import AboutPage from './components/ElimcrownWebsite/pages/AboutPage';
import PlayroomPage from './components/ElimcrownWebsite/pages/PlayroomPage';
import SplashScreen from './components/mobile/SplashScreen';
// import Registration from './components/auth/RegisterForm'; // Use the consolidated register form if needed, but we already have routes
import SuperAdminDashboard from './components/EDucore/SuperAdminDashboard'; // Legacy path, but functional
import api from './services/api';
import { clearPortalSchoolId, setPortalSchoolId } from './services/tenantContext';
import { SocketProvider } from './contexts/SocketContext';

const parseTenantFromPath = (pathname) => {
  const parts = (pathname || '/').split('/').filter(Boolean);
  if (parts[0] !== 't') return { schoolId: null, view: null };
  const schoolId = parts[1] || null;
  const view = parts[2] || null;
  return { schoolId, view };
};

function NavigateToTenantLogin({ pathname }) {
  const { schoolId } = parseTenantFromPath(pathname);
  return <Navigate to={schoolId ? `/t/${schoolId}/login` : '/'} replace />;
}

function AppContent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { schoolId: urlSchoolId } = parseTenantFromPath(pathname);
  const [appReady, setAppReady] = useState(false);
  
  // Detect mobile/Capacitor once
  const isMobile = window.Capacitor || /mobile|android|iphone/i.test(navigator.userAgent);

  const [brandingSettings, setBrandingSettings] = useState({
    logoUrl: '/logo-new.png',
    faviconUrl: '/favicon.png',
    stampUrl: '/stamp.svg',
    brandColor: '#520050',
    welcomeTitle: 'Welcome to Elimcrown',
    welcomeMessage: 'Unified education management for schools and institutions.',
    onboardingTitle: 'Create Your Elimcrown Account',
    onboardingMessage: 'Sign up to access powerful tools for managing learning and assessment.',
    schoolName: 'ZAWADI JUNIOR ACADEMY',
  });

  // Handle browser back button to stay within the app
  useEffect(() => {
    const handlePopState = (event) => {
      // If going back would exit the app, prevent it and navigate to the last saved page
      const currentPath = window.location.pathname;
      
      if (isAuthenticated) {
        // If we're authenticated but navigating outside the app, redirect back
        if (!currentPath.startsWith('/app') && !currentPath.startsWith('/superadmin')) {
          event.preventDefault();
          
          // Try to restore the last page from localStorage
          const lastPage = localStorage.getItem('cbc_current_page') || 'dashboard';
          navigate(`/app/${lastPage}`, { replace: true });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, navigate]);

  // Mark app as ready after initial load
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!urlSchoolId) return;
    let cancelled = false;
    const run = async () => {
      try {
        setPortalSchoolId(urlSchoolId);
        const resp = await api.auth.tenantPublic(urlSchoolId);
        if (cancelled) return;
        const t = resp?.data;
        if (!t) return;
        setBrandingSettings((prev) => ({
          ...prev,
          logoUrl: t.logoUrl || prev.logoUrl,
          faviconUrl: t.faviconUrl || prev.faviconUrl,
          stampUrl: t.stampUrl || prev.stampUrl,
          brandColor: t.brandColor || prev.brandColor,
          welcomeTitle: t.welcomeTitle || prev.welcomeTitle,
          welcomeMessage: t.welcomeMessage || prev.welcomeMessage,
          onboardingTitle: t.onboardingTitle || prev.onboardingTitle,
          onboardingMessage: t.onboardingMessage || prev.onboardingMessage,
          schoolName: t.schoolName || prev.schoolName,
        }));
      } catch {
        if (!cancelled) clearPortalSchoolId();
      }
    };
    run();
    return () => { cancelled = true; };
  }, [urlSchoolId]);


  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    const url = brandingSettings.faviconUrl;
    if (!url) { link.href = '/favicon.png'; return; }
    if (url.startsWith('data:')) link.href = url;
    else link.href = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  }, [brandingSettings.faviconUrl]);

  useEffect(() => {
    let title = 'Elimcrown V1';
    if (!isAuthenticated) {
      const { schoolId, view } = parseTenantFromPath(pathname);
      if (schoolId) title = `${brandingSettings.schoolName || 'Elimcrown'} — ${view === 'get-started' ? 'Get Started' : 'Login'}`;
      else if (pathname === '/') title = 'Elimcrown — Home';
      else if (pathname === '/get-started') title = 'Elimcrown — Get Started';
      else if (pathname.startsWith('/auth')) title = 'Elimcrown — Login';
    } else {
      title = user?.role === 'SUPER_ADMIN'
        ? 'Elimcrown — Super Admin'
        : `${(user?.school?.name || user?.schoolName) || brandingSettings.schoolName || 'Elimcrown'} — Dashboard`;
    }
    document.title = title;
  }, [isAuthenticated, pathname, user, brandingSettings.schoolName]);

  const handleAuthSuccess = (userData, token, refreshToken) => {
    login(userData, token, refreshToken);
    navigate(userData?.role === 'SUPER_ADMIN' ? '/superadmin' : '/app', { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'SUPER_ADMIN') {
        if (pathname.startsWith('/t/') || pathname.startsWith('/auth') || pathname === '/' || pathname === '/get-started') {
          navigate('/superadmin', { replace: true });
        } else if (!pathname.startsWith('/superadmin')) {
          navigate('/superadmin', { replace: true });
        }
      } else {
        if (pathname.startsWith('/t/') || pathname.startsWith('/auth') || pathname === '/' || pathname === '/get-started') {
          navigate('/app', { replace: true });
        } else if (!pathname.startsWith('/app')) {
          navigate('/app', { replace: true });
        }
      }
    } else {
      if (pathname.startsWith('/app') || pathname.startsWith('/superadmin')) {
        navigate('/', { replace: true });
      }
      const { schoolId, view } = parseTenantFromPath(pathname);
      if (schoolId && !view) {
        navigate(`/t/${schoolId}/login`, { replace: true });
      }
    }
  }, [isAuthenticated, user?.role, pathname, navigate]);

  const landingProps = {
    onLoginClick: () => navigate('/auth/login'),
    onGetStartedClick: () => navigate('/auth/register'),
    onOpenAppClick: () => navigate('/app'),
    isAuthenticated: !!isAuthenticated,
  };

  if (isAuthenticated) {
    return (
      <>
        <SplashScreen isLoading={!appReady} />
        {appReady && (
          <>
            <Routes>
              <Route path="/superadmin" element={<SuperAdminDashboard onLogout={handleLogout} />} />
              <Route
                path="/app/*"
                element={
                  <CBCGradingSystem
                    user={user}
                    onLogout={handleLogout}
                    brandingSettings={brandingSettings}
                    setBrandingSettings={setBrandingSettings}
                  />
                }
              />
              <Route
                path="*"
                element={<Navigate to={user?.role === 'SUPER_ADMIN' ? '/superadmin' : '/app'} replace />}
              />
            </Routes>
            {/* <SupportWidget /> */}
          </>
        )}
      </>
    );
  }

  return (
    <>
      <SplashScreen isLoading={!appReady} />
      {appReady && (
        <Routes>
          {/* Mobile/Capacitor: redirect "/" to login page directly */}
          {isMobile && <Route path="/" element={<Navigate to="/auth/login" replace />} />}
          {/* Desktop/Web: show homepage */}
          {!isMobile && <Route path="/" element={<HomePage {...landingProps} />} />}
          <Route path="/features" element={<FeaturesPage {...landingProps} />} />
          <Route path="/solutions" element={<SolutionsPage {...landingProps} />} />
          <Route path="/pricing" element={<PricingPage {...landingProps} />} />
          <Route path="/contact" element={<ContactPage {...landingProps} />} />
          <Route path="/about" element={<AboutPage {...landingProps} />} />
          <Route path="/playroom" element={<PlayroomPage {...landingProps} />} />
          <Route path="/get-started" element={<Navigate to="/auth/register" replace />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath="/auth" />} />
          <Route path="/auth/register" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath="/auth" />} />
          <Route path="/auth/forgot-password" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath="/auth" />} />
          <Route path="/auth/reset-password" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath="/auth" />} />
          <Route path="/auth/verify-email" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath="/auth" />} />
          <Route path="/auth/welcome" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath="/auth" />} />
          <Route path="/t/:schoolId" element={<NavigateToTenantLogin pathname={pathname} />} />
          <Route path="/t/:schoolId/login" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath={`/t/${urlSchoolId || ''}`} />} />
          <Route path="/t/:schoolId/register" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath={`/t/${urlSchoolId || ''}`} />} />
          <Route path="/t/:schoolId/forgot-password" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath={`/t/${urlSchoolId || ''}`} />} />
          <Route path="/t/:schoolId/reset-password" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath={`/t/${urlSchoolId || ''}`} />} />
          <Route path="/t/:schoolId/verify-email" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath={`/t/${urlSchoolId || ''}`} />} />
          <Route path="/t/:schoolId/welcome" element={<Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} basePath={`/t/${urlSchoolId || ''}`} />} />
          <Route path="/t/:schoolId/get-started" element={<Navigate to={`/t/${urlSchoolId}/register`} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      {/* <SupportWidget /> */}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </BrowserRouter>
  );
}
