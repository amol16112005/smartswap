import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import { apiFetch } from '../lib/apiClient';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useDocumentTitle('Login — SmartSwap');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoggingIn(true);
    setLoginError('');

    try {
      const { data } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email: email.trim() },
      });

      onLogin({ email: data.email, token: data.token });
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Could not authenticate. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '80px auto', padding: '40px 30px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', marginBottom: '14px' }}><Shield size={28} aria-hidden="true" /></div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800' }}>Secure Space Login</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Enter your email for a secure private session.</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="login-email" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Identity Email Address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., engineer@university.edu"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none' }}
            disabled={loggingIn}
            aria-invalid={!!loginError}
            aria-describedby={loginError ? 'login-error' : undefined}
          />
        </div>
        <button
          type="submit"
          disabled={loggingIn}
          aria-busy={loggingIn}
          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: loggingIn ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px', opacity: loggingIn ? 0.7 : 1 }}
        >
          {loggingIn ? 'Securing Session...' : <>Authenticate Identity <LogIn size={16} aria-hidden="true" /></>}
        </button>
        {loginError && <p id="login-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }}>{loginError}</p>}
      </form>
      <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '16px' }}>
        Your data is protected with secure tokens. No passwords stored.
      </p>
    </div>
  );
}