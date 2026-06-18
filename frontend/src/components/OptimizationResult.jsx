import { ChevronRight } from 'lucide-react';

export function OptimizationResult({
  result,
  celebrationFallback = 'Your plan is already the most optimized choice!',
  gridStyle = {},
}) {
  if (!result) return null;

  return (
    <>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', ...gridStyle }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#475569' }}>Baseline Vector</h4>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>₹{result.userOriginalWay?.costINR?.toLocaleString('en-IN')}</div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>{result.userOriginalWay?.qualityMetric}</p>
          {result.userOriginalWay?.softSuggestion && (
            <p role="note" style={{ fontSize: '12px', color: '#b45309', background: '#fffbeb', padding: '8px', borderRadius: '6px', margin: '10px 0 0 0' }}>
              <strong>Warning:</strong> {result.userOriginalWay.softSuggestion}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {result.smartAlternatives?.map((alt, i) => (
            <div key={i} style={{ background: '#fff', border: '2px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{alt.badge}</span>
                <h5 style={{ margin: '6px 0 2px 0', fontSize: '16px', fontWeight: '700' }}>{alt.title}</h5>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                  <span aria-hidden="true">🌱 </span>
                  {alt.carbonSavedPercent}% carbon footprint reduction
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>₹{alt.costINR?.toLocaleString('en-IN')}</div>
                <a
                  href={alt.actionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Deploy ${alt.title} (opens in new tab)`}
                  style={{ background: '#0f172a', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Deploy <ChevronRight size={12} aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
          {result.isAlreadyOptimal && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: '#166534', margin: 0, fontWeight: '600' }}>
                {result.celebrationMessage || celebrationFallback}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}