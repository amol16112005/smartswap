import { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, History, User, ChevronRight, Share2, Trash2, Check } from 'lucide-react';
import { apiUrl } from '../config';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { OptimizationResult } from './OptimizationResult';

export function DashboardPage({ auth }) {
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

  useDocumentTitle('Dashboard — SmartSwap');

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      setLoadingHistory(true);
      try {
        const response = await fetch(apiUrl('/api/history'), {
          headers: { ...authHeaders },
        });
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('smartswap_auth');
          window.location.reload();
          return;
        }
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          const data = contentType.includes('application/json')
            ? await response.json()
            : await response.text().then((t) => { throw new Error('History endpoint returned non-JSON: ' + t.substring(0, 100)); });
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
          ...authHeaders,
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
        : await response.text().then((t) => { throw new Error('Optimize returned non-JSON: ' + t.substring(0, 100)); });

      setResult(resData.optimization);
      if (resData.offlineFallback) {
        setOfflineNotice(
          resData.fallbackReason
            ? `Live AI unavailable: ${resData.fallbackReason} Showing estimated alternatives instead.`
            : 'Live AI is temporarily unavailable. Showing estimated alternatives instead.',
        );
      }

      if (resData.historyEntry) {
        setHistory((prev) => [resData.historyEntry, ...prev]);
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
    }).catch((err) => console.error('Clipboard copy failed:', err));
  };

  const handleDeleteHistoryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this history log?')) return;
    try {
      const response = await fetch(apiUrl(`/api/history/${id}`), {
        method: 'DELETE',
        headers: { ...authHeaders },
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('smartswap_auth');
        alert('Your session expired. Please log in again.');
        window.location.reload();
        return;
      }
      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
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
      <aside aria-label="Profile and history" style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ background: '#e2f5ea', color: '#16a34a', padding: '10px', borderRadius: '12px' }}><User size={20} aria-hidden="true" /></div>
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
              No history found.<br />Optimize a plan to start logging!
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
                      width: '100%',
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
            <div role="status" aria-live="polite" style={{ color: '#1e40af', marginTop: '12px', fontSize: '14px', background: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Site is working — demo mode active</strong>
              {offlineNotice}
            </div>
          )}
          {error && <p id="optimize-error" role="alert" aria-live="polite" style={{ color: '#dc2626', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
        </section>

        {result && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
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
                      onMouseEnter={(e) => { e.target.style.background = '#e2e8f0'; }}
                      onMouseLeave={(e) => { e.target.style.background = '#f1f5f9'; }}
                    >
                      {copiedId === history[activeHistoryIndex]._id ? (
                        <>
                          <Check size={14} style={{ color: '#16a34a' }} aria-hidden="true" /> Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={14} aria-hidden="true" /> Share Link
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteHistoryItem(history[activeHistoryIndex]._id)}
                      aria-label="Delete this history log"
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.target.style.background = '#fecaca'; }}
                      onMouseLeave={(e) => { e.target.style.background = '#fee2e2'; }}
                    >
                      <Trash2 size={14} aria-hidden="true" /> Delete Log
                    </button>
                  </>
                )}
              </div>
            </div>

            <OptimizationResult result={result} />
          </div>
        )}
      </div>
    </div>
  );
}