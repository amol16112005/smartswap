import { memo } from 'react';
import { History, User, ChevronRight, RefreshCw } from 'lucide-react';

export const HistorySidebar = memo(function HistorySidebar({
  userEmail,
  history,
  loading,
  activeHistoryId,
  onSelect,
}) {
  return (
    <aside
      aria-label="Profile and history"
      style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ background: '#e2f5ea', color: '#16a34a', padding: '10px', borderRadius: '12px' }}>
          <User size={20} aria-hidden="true" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Active Operator</div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={14} aria-hidden="true" /> Click Logs to Re-open
        </h3>
        {loading ? (
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
            {history.map((item) => {
              const isActive = activeHistoryId === item._id;
              return (
                <button
                  type="button"
                  key={item._id}
                  role="listitem"
                  onClick={() => onSelect(item)}
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
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Just Now'}
                  </span>
                  <strong style={{ color: '#334155', display: 'block', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: '20px' }}>
                    {item.query}
                  </strong>
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
  );
});