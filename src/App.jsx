import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import CBCGradingSystem from './components/CBCGrading/CBCGradingSystem';
import EDucoreLanding from './components/EDucore/EDucoreLanding2';
import Registration from './components/EDucore/RegistrationFull';
import SuperAdminDashboard from './components/EDucore/SuperAdminDashboard';
import api from './services/api';
import { clearPortalSchoolId, setPortalSchoolId } from './services/tenantContext';

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

  const [brandingSettings, setBrandingSettings] = useState(() => {
    return {
      logoUrl: localStorage.getItem('schoolLogo') || '/logo-zawadi.png',
      faviconUrl: localStorage.getItem('schoolFavicon') || '/favicon.png',
      brandColor: localStorage.getItem('brandColor') || '#1e3a8a',
      welcomeTitle: localStorage.getItem('welcomeTitle') || 'Welcome to EDucore V1',
      welcomeMessage: localStorage.getItem('welcomeMessage') || 'Unified education management for schools and institutions.',
      onboardingTitle: localStorage.getItem('onboardingTitle') || 'Create Your EDucore Account',
      onboardingMessage: localStorage.getItem('onboardingMessage') || 'Sign up to access powerful tools for managing learning and assessment.',
      schoolName: localStorage.getItem('schoolName') || 'EDucore',
    };
  });

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
    if (brandingSettings.logoUrl && brandingSettings.logoUrl !== '/logo-zawadi.png')
      localStorage.setItem('schoolLogo', brandingSettings.logoUrl);
    if (brandingSettings.schoolName) localStorage.setItem('schoolName', brandingSettings.schoolName);
    if (brandingSettings.faviconUrl && brandingSettings.faviconUrl !== '/favicon.png')
      localStorage.setItem('schoolFavicon', brandingSettings.faviconUrl);
  }, [brandingSettings]);

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
    let title = 'EDucore V1';
    if (!isAuthenticated) {
      const { schoolId, view } = parseTenantFromPath(pathname);
      if (schoolId) title = `${brandingSettings.schoolName || 'EDucore V1'} — ${view === 'get-started' ? 'Get Started' : 'Login'}`;
      else if (pathname === '/') title = 'EDucore V1 — Home';
      else if (pathname === '/get-started') title = 'EDucore V1 — Get Started';
      else if (pathname.startsWith('/auth')) title = 'EDucore V1 — Login';
    } else {
      title = user?.role === 'SUPER_ADMIN'
        ? 'EDucore V1 — Super Admin'
        : `${(user?.school?.name || user?.schoolName) || brandingSettings.schoolName || 'EDucore V1'} — Dashboard`;
    }
    document.title = title;
  }, [isAuthenticated, pathname, user, brandingSettings.schoolName]);

  const handleAuthSuccess = (userData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || 'temp-token';
    login(userData, token);
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
    onGetStartedClick: () => navigate('/get-started'),
    onOpenAppClick: () => navigate('/app'),
    isAuthenticated: !!isAuthenticated,
  };

  if (isAuthenticated) {
    return (
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
    );
  }

  return (
    <Routes>
      <Route path="/" element={<EDucoreLanding {...landingProps} />} />
      <Route path="/get-started" element={<Registration />} />
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
      <Route path="/t/:schoolId/get-started" element={<Registration />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
