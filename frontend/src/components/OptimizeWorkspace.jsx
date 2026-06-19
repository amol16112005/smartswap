import { memo } from 'react';
import { ArrowRight, RefreshCw, Share2, Trash2, Check } from 'lucide-react';
import { OptimizationResult } from './OptimizationResult';

export const OptimizeWorkspace = memo(function OptimizeWorkspace({
  userPlan,
  onPlanChange,
  onSubmit,
  loading,
  error,
  offlineNotice,
  result,
  activeEntry,
  copiedId,
  onCopyShare,
  onDelete,
}) {
  return (
    <div aria-label="Optimization workspace">
      <section
        aria-labelledby="optimize-heading"
        style={{
          background: '#ffffff',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          marginBottom: '30px',
        }}
      >
        <form onSubmit={onSubmit}>
          <label id="optimize-heading" htmlFor="user-plan-input" style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '16px', color: '#1e293b' }}>
            Initiate Procurement Swap Evaluation
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              id="user-plan-input"
              name="userPlan"
              type="text"
              value={userPlan}
              onChange={(e) => onPlanChange(e.target.value)}
              placeholder="Describe physical event, transport, or raw sourcing layout..."
              style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none' }}
              disabled={loading}
              aria-describedby={error ? 'optimize-error' : undefined}
              aria-invalid={!!error}
            />
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-label={loading ? 'Evaluating procurement plan' : 'Evaluate procurement plan'}
              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <RefreshCw size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>Evaluate <ArrowRight size={16} aria-hidden="true" /></>
              )}
            </button>
          </div>
        </form>
        {offlineNotice && (
          <div role="status" aria-live="polite" style={{ color: '#1e40af', marginTop: '12px', fontSize: '14px', background: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Site is working — demo mode active</strong>
            {offlineNotice}
          </div>
        )}
        {error && (
          <p id="optimize-error" role="alert" aria-live="polite" style={{ color: '#dc2626', marginTop: '12px', fontSize: '14px' }}>
            {error}
          </p>
        )}
      </section>

      {result && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {activeEntry
                ? `Saved Log: ${new Date(activeEntry.timestamp).toLocaleString()}`
                : 'New Evaluation Output'}
            </span>
            {activeEntry && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onCopyShare(activeEntry._id)}
                  aria-label="Copy share link for this evaluation"
                  style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copiedId === activeEntry._id ? (
                    <><Check size={14} style={{ color: '#16a34a' }} aria-hidden="true" /> Copied!</>
                  ) : (
                    <><Share2 size={14} aria-hidden="true" /> Share Link</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(activeEntry._id)}
                  aria-label="Delete this history log"
                  style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} aria-hidden="true" /> Delete Log
                </button>
              </div>
            )}
          </div>
          <OptimizationResult result={result} />
        </div>
      )}
    </div>
  );
});