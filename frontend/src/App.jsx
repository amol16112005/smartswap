import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';

let LandingPage;
let LoginPage;
let DashboardPage;
let SharedSwapPage;

if (import.meta.env.VITEST) {
  const [landingMod, loginMod, dashboardMod, sharedMod] = await Promise.all([
    import('./components/LandingPage'),
    import('./components/LoginPage'),
    import('./components/DashboardPage'),
    import('./components/SharedSwapPage'),
  ]);
  LandingPage = landingMod.LandingPage;
  LoginPage = loginMod.LoginPage;
  DashboardPage = dashboardMod.DashboardPage;
  SharedSwapPage = sharedMod.SharedSwapPage;
} else {
  LandingPage = lazy(() =>
    import('./components/LandingPage').then((mod) => ({ default: mod.LandingPage })),
  );
  LoginPage = lazy(() =>
    import('./components/LoginPage').then((mod) => ({ default: mod.LoginPage })),
  );
  DashboardPage = lazy(() =>
    import('./components/DashboardPage').then((mod) => ({ default: mod.DashboardPage })),
  );
  SharedSwapPage = lazy(() =>
    import('./components/SharedSwapPage').then((mod) => ({ default: mod.SharedSwapPage })),
  );
}

function PageFallback() {
  return (
    <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', fontWeight: '500' }}>
      Loading page...
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('smartswap_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && parsed.token) return parsed;
      }
    } catch {
      // ignore malformed data
    }
    return null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem('smartswap_auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('smartswap_auth');
    }
  }, [auth]);

  const handleLogout = (navigateCallback) => {
    setAuth(null);
    localStorage.removeItem('smartswap_auth');
    navigateCallback('/');
  };

  const handleLogin = (authData) => {
    setAuth(authData);
  };

  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar auth={auth} onLogout={handleLogout} />
      <main id="main-content" style={{ padding: '0 40px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 110px)', paddingTop: '20px' }}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route
              path="/dashboard"
              element={auth ? <DashboardPage auth={auth} /> : <LoginPage onLogin={handleLogin} />}
            />
            <Route path="/share/:id" element={<SharedSwapPage />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}