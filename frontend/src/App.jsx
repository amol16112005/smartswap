import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingDown, RefreshCw, Zap, Shield, History, User, LogIn, LogOut, ChevronRight, Share2, Trash2, Check } from 'lucide-react';
import { apiUrl } from './config';

// ==========================================
// 1. LANDING & MISSION PAGE
// ==========================================
function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e2f5ea', color: '#15803d', padding: '8px 18px', borderRadius: '30px', fontWeight: '600', fontSize: '13px', marginBottom: '24px' }}>
        <Sparkles size={14} aria-hidden="true" /> Redefining Sustainable Consumer Choices
      </div>
      <h1 style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 16px 0', lineHeight: '1.1' }}>
        Smart<span style={{ color: '#16a34a' }}>Swap</span>
      </h1>
      <p style={{ fontSize: '20px', color: '#475569', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
        An intelligent intervention engine designed to intercept supply chain decisions at the source, transforming cost-heavy plans into high-value, green alternatives.
      </p>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px' }}>
        <button type="button" onClick={() => navigate('/login')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '16px 36px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px -4px rgba(22,163,74,0.3)' }}>
          Access Your Personal Space <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', textAlign: 'left', marginTop: '40px' }}>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#16a34a', marginBottom: '14px' }}><Zap size={28} fill="#16a34a" style={{ opacity: 0.2 }} /></div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Pre-Consumption Intercept</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', lineHeight: '1.5' }}>Don't just track carbon footprint after the damage is done. Swap your purchasing plans for cleaner options before spending a single rupee.</p>
        </div>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#2563eb', marginBottom: '14px' }}><Shield size={28} fill="#2563eb" style={{ opacity: 0.2 }} /></div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Secure Private Accounts</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', lineHeight: '1.5' }}>Your procurement data is guarded behind full user profiles, creating a permanent, audit-ready log of your historical climate contributions.</p>
        </div>
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#7c3aed', marginBottom: '14px' }}><TrendingDown size={28} style={{ color: '#7c3aed' }} /></div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Dynamic INR Optimization</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', lineHeight: '1.5' }}>Powered directly by generative AI to cross-reference market costs, ensuring ecological alternatives remain highly competitive.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. SECURE GATEWAY (LOGIN) PAGE — real token-backed auth
// ==========================================
function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        // Backend (or wrong server) returned HTML or text instead of JSON
        const text = await res.text().catch(() => '');
        throw new Error(
          `Backend did not return JSON (got HTML/text instead). ` +
          `Is the Express server actually running on port 5000? ` +
          `Response started with: ${text.substring(0, 120)}`
        );
      }

      if (!res.ok) throw new Error(data.error || 'Login failed');

      // onLogin receives full auth object: { email, token }
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

// ==========================================
// 3. PERSONAL LOGGED-IN WORKSPACE (token-secured)
// ==========================================
function DashboardPage({ auth }) {
  const userEmail = auth?.email;
  const token = auth?.token;

  const [userPlan, setUserPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offlineNotice, setOfflineNotice] = useState('');
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Helper to attach Authorization header for protected calls
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch history from backend API on mount or auth change — now uses token
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      setLoadingHistory(true);
      try {
        const response = await fetch(apiUrl('/api/history'), {
          headers: { ...authHeaders }
        });
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid — force clean re-login for smooth recovery
          localStorage.removeItem('smartswap_auth');
          window.location.reload();
          return;
        }
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          const data = contentType.includes('application/json')
            ? await response.json()
            : await response.text().then(t => { throw new Error('History endpoint returned non-JSON: ' + t.substring(0,100)); });
          setHistory(data);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!userPlan.trim()) return;

    setLoading(true);
    setError('');
    setOfflineNotice('');
    setResult(null);
    setActiveHistoryIndex(null);

    try {
      const response = await fetch(apiUrl('/api/optimize'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ userPlan }),
      });
      if (!response.ok) {
        const txt = await response.text().catch(() => '');
        let message = 'The AI engine is temporarily busy. Please try again in a few seconds.';
        try {
          const parsed = JSON.parse(txt);
          if (parsed?.error) {
            message = typeof parsed.error === 'string'
              ? parsed.error
              : (parsed.error.message || 'The AI engine is temporarily busy. Please try again shortly.');
          }
        } catch {
          if (/high demand|503|UNAVAILABLE/i.test(txt)) {
            message = 'The AI engine is experiencing high demand. Please try again shortly.';
          }
        }
        throw new Error(message);
      }
      const contentType = response.headers.get('content-type') || '';
      const resData = contentType.includes('application/json')
        ? await response.json()
        : await response.text().then(t => { throw new Error('Optimize returned non-JSON: ' + t.substring(0,100)); });

      setResult(resData.optimization);
      if (resData.offlineFallback) {
        setOfflineNotice(
          resData.fallbackReason
            ? `Live AI unavailable: ${resData.fallbackReason} Showing estimated alternatives instead.`
            : 'Live AI is temporarily unavailable. Showing estimated alternatives instead.'
        );
      }

      if (resData.historyEntry) {
        setHistory(prev => [resData.historyEntry, ...prev]);
        setActiveHistoryIndex(0);
      }
    } catch (err) {
      setError(err.message || 'Error executing optimization call.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item, idx) => {
    setActiveHistoryIndex(idx);
    setUserPlan(item.query);
    setResult(item.data);
  };

  const handleCopyShareLink = (id) => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => console.error('Clipboard copy failed:', err));
  };

  const handleDeleteHistoryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this history log?')) return;
    try {
      const response = await fetch(apiUrl(`/api/history/${id}`), {
        method: 'DELETE',
        headers: { ...authHeaders }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('smartswap_auth');
        alert('Your session expired. Please log in again.');
        window.location.reload();
        return;
      }
      if (response.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
        setResult(null);
        setUserPlan('');
        setActiveHistoryIndex(null);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || 'Failed to delete history log.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error connecting to server.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', minHeight: 'calc(100vh - 120px)' }}>

      {/* Left Column Profile & Interactive History Vault */}
      <aside aria-label="Profile and history" style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ background: '#e2f5ea', color: '#16a34a', padding: '10px', borderRadius: '12px' }}><User size={20} /></div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Active Operator</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={14} aria-hidden="true" /> Click Logs to Re-open
          </h3>
          {loadingHistory ? (
            <div role="status" aria-live="polite" aria-busy="true" style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: '13px' }}>
              <RefreshCw size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px auto', display: 'block' }} />
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: '13px', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
              No history found.<br/>Optimize a plan to start logging!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} role="list">
              {history.map((item, idx) => {
                const isActive = activeHistoryIndex === idx;
                return (
                  <button
                    type="button"
                    key={item._id || idx}
                    role="listitem"
                    onClick={() => handleSelectHistoryItem(item, idx)}
                    aria-pressed={isActive}
                    aria-label={`Open history log: ${item.query}`}
                    style={{
                      background: isActive ? '#f0fdf4' : '#f8fafc',
                      padding: '14px',
                      borderRadius: '12px',
                      border: isActive ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Just Now'}
                    </span>
                    <strong style={{ color: '#334155', display: 'block', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: '20px' }}>{item.query}</strong>
                    <span style={{ color: '#16a34a', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      Open Analysis <ChevronRight size={12} aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Right Column Core Optimization Desk */}
      <div aria-label="Optimization workspace">
        <section aria-labelledby="optimize-heading" style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
          <form onSubmit={handleOptimize}>
            <label id="optimize-heading" htmlFor="user-plan-input" style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '16px', color: '#1e293b' }}>Initiate Procurement Swap Evaluation</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input id="user-plan-input" name="userPlan" type="text" value={userPlan} onChange={(e) => setUserPlan(e.target.value)} placeholder="Describe physical event, transport, or raw sourcing layout..." style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none' }} disabled={loading} aria-describedby={error ? 'optimize-error' : undefined} aria-invalid={!!error} />
              <button type="submit" disabled={loading} aria-busy={loading} aria-label={loading ? 'Evaluating procurement plan' : 'Evaluate procurement plan'} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading ? <RefreshCw size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} /> : <>Evaluate <ArrowRight size={16} aria-hidden="true" /></>}
              </button>
            </div>
          </form>
          {offlineNotice && (
            <div role="status" aria-live="polite" style={{ color: '#92400e', marginTop: '12px', fontSize: '14px', background: '#fffbeb', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Site is working — demo mode active</strong>
              {offlineNotice}
            </div>
          )}
          {error && <p id="optimize-error" role="alert" aria-live="polite" style={{ color: '#dc2626', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
        </section>

        {/* Dynamic Display for Live Evaluation Outputs */}
        {result && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* Active Report Header with Share & Delete Operations */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                {activeHistoryIndex !== null && history[activeHistoryIndex] 
                  ? `Saved Log: ${new Date(history[activeHistoryIndex].timestamp).toLocaleString()}` 
                  : 'New Evaluation Output'}
              </span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {activeHistoryIndex !== null && history[activeHistoryIndex] && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopyShareLink(history[activeHistoryIndex]._id)}
                      aria-label="Copy share link for this evaluation"
                      style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                      onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                    >
                      {copiedId === history[activeHistoryIndex]._id ? (
                        <>
                          <Check size={14} style={{ color: '#16a34a' }} /> Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={14} /> Share Link
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteHistoryItem(history[activeHistoryIndex]._id)}
                      aria-label="Delete this history log"
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.target.style.background = '#fecaca'}
                      onMouseLeave={(e) => e.target.style.background = '#fee2e2'}
                    >
                      <Trash2 size={14} /> Delete Log
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1, background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>FINANCIAL EFFICIENCY</div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#14532d' }}>{result.efficiencyStats?.costRating}</div>
              </div>
              <div style={{ flex: 1, background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700' }}>EMISSION REDUCTION INDEX</div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#1e3a8a' }}>{result.efficiencyStats?.carbonScore}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#475569' }}>Baseline Vector</h4>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>₹{result.userOriginalWay?.costINR?.toLocaleString('en-IN')}</div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>{result.userOriginalWay?.qualityMetric}</p>
                {result.userOriginalWay?.softSuggestion && (
                  <p style={{ fontSize: '12px', color: '#b45309', background: '#fffbeb', padding: '8px', borderRadius: '6px', margin: '10px 0 0 0' }}>⚠️ {result.userOriginalWay.softSuggestion}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {result.smartAlternatives?.map((alt, i) => (
                  <div key={i} style={{ background: '#fff', border: '2px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{alt.badge}</span>
                      <h5 style={{ margin: '6px 0 2px 0', fontSize: '16px', fontWeight: '700' }}>{alt.title}</h5>
                      <span style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>🌱 {alt.carbonSavedPercent}% Footprint Cut</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>₹{alt.costINR?.toLocaleString('en-IN')}</div>
                      <a href={alt.actionLink} target="_blank" rel="noreferrer" style={{ background: '#0f172a', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Deploy <ChevronRight size={12} /></a>
                    </div>
                  </div>
                ))}
                {result.isAlreadyOptimal && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#166534', margin: 0, fontWeight: '600' }}>🎉 {result.celebrationMessage || "Your plan is already the most optimized choice!"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. PUBLIC SHARED VIEW PAGE
// ==========================================
function SharedSwapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [swapData, setSwapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedSwap = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/api/history/${id}`));
        if (!response.ok) throw new Error('Shared swap optimization not found or server is offline.');
        const data = await response.json();
        setSwapData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedSwap();
  }, [id]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw size={32} aria-hidden="true" style={{ animation: 'spin 1s linear infinite', color: '#16a34a' }} />
        <p style={{ color: '#64748b', fontWeight: '500' }}>Synchronizing swap configurations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px 30px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', marginBottom: '16px' }}><Shield size={48} style={{ opacity: 0.5 }} /></div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 10px 0' }}>Report Unavailable</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
        <button type="button" onClick={() => navigate('/')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
          Go to Home Hub
        </button>
      </div>
    );
  }

  const result = swapData.data;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e2f5ea', color: '#15803d', padding: '8px 18px', borderRadius: '30px', fontWeight: '600', fontSize: '13px', marginBottom: '16px' }}>
          <Sparkles size={14} /> Shared Procurement Swap Evaluation
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>SmartSwap Optimization Report</h2>
        <p style={{ color: '#64748b', marginTop: '12px', fontSize: '15px' }}>Original Procurement Query: <strong style={{ color: '#334155' }}>"{swapData.query}"</strong></p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>FINANCIAL EFFICIENCY</div>
          <div style={{ fontWeight: '800', fontSize: '16px', color: '#14532d' }}>{result.efficiencyStats?.costRating}</div>
        </div>
        <div style={{ flex: 1, background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700' }}>EMISSION REDUCTION INDEX</div>
          <div style={{ fontWeight: '800', fontSize: '16px', color: '#1e3a8a' }}>{result.efficiencyStats?.carbonScore}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#475569' }}>Baseline Vector</h4>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>₹{result.userOriginalWay?.costINR?.toLocaleString('en-IN')}</div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>{result.userOriginalWay?.qualityMetric}</p>
          {result.userOriginalWay?.softSuggestion && (
            <p style={{ fontSize: '12px', color: '#b45309', background: '#fffbeb', padding: '8px', borderRadius: '6px', margin: '10px 0 0 0' }}>⚠️ {result.userOriginalWay.softSuggestion}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {result.smartAlternatives?.map((alt, i) => (
            <div key={i} style={{ background: '#fff', border: '2px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{alt.badge}</span>
                <h5 style={{ margin: '6px 0 2px 0', fontSize: '16px', fontWeight: '700' }}>{alt.title}</h5>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>🌱 {alt.carbonSavedPercent}% Footprint Cut</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>₹{alt.costINR?.toLocaleString('en-IN')}</div>
                <a href={alt.actionLink} target="_blank" rel="noreferrer" style={{ background: '#0f172a', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Deploy <ChevronRight size={12} /></a>
              </div>
            </div>
          ))}
          {result.isAlreadyOptimal && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: '#166534', margin: 0, fontWeight: '600' }}>🎉 {result.celebrationMessage || "This plan is already fully optimized!"}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Want to evaluate another supply chain choice or carbon plan?</p>
        <button type="button" onClick={() => navigate('/')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          Evaluate Your Own Plan with SmartSwap
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 5. MAIN APP FRAMEWORK WRAPPER
// ==========================================
export default function App() {
  // auth = { email, token } | null   — real secure session
  // Lazy initializer reads localStorage once on mount (avoids setState-in-effect warning)
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

  // Persist auth changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem('smartswap_auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('smartswap_auth');
    }
  }, [auth]);

  // Modular Logout Engine
  const handleLogout = (navigateCallback) => {
    setAuth(null);
    localStorage.removeItem('smartswap_auth');
    navigateCallback('/');
  };

  // Login handler now receives full auth object from LoginPage
  const handleLogin = (authData) => {
    setAuth(authData);
  };

  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <InnerNavbar auth={auth} onLogout={handleLogout} />
      <main id="main-content" style={{ padding: '0 40px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 110px)', paddingTop: '20px' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/dashboard" 
            element={auth ? <DashboardPage auth={auth} /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route path="/share/:id" element={<SharedSwapPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// Navigation Helper to safely utilize internal Router hooks
function InnerNavbar({ auth, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav aria-label="Primary" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" aria-label="SmartSwap home" style={{ textDecoration: 'none', fontSize: '22px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        Smart<span style={{ color: '#16a34a' }}>Swap</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#475569', fontSize: '14px', fontWeight: '500' }}>Mission Platform</Link>
        {auth ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', background: '#e2f5ea', color: '#15803d', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Dashboard Desk</Link>
            <button
              type="button"
              onClick={() => onLogout(navigate)}
              aria-label="Log out of your account"
              style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.target.style.color = '#dc2626'; e.target.style.borderColor = '#fca5a5'; }}
              onMouseLeave={(e) => { e.target.style.color = '#64748b'; e.target.style.borderColor = '#cbd5e1'; }}
            >
              Logout <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', background: '#0f172a', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Operator Login</Link>
        )}
      </div>
    </nav>
  );
}