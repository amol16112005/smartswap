import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw, Shield, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/apiClient';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { OptimizationResult } from './OptimizationResult';

export function SharedSwapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [swapData, setSwapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentTitle('Shared Swap — SmartSwap');

  useEffect(() => {
    const fetchSharedSwap = async () => {
      try {
        setLoading(true);
        const { data } = await apiFetch(`/api/history/${id}`);
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
        <div style={{ color: '#dc2626', marginBottom: '16px' }}><Shield size={48} style={{ opacity: 0.5 }} aria-hidden="true" /></div>
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
          <Sparkles size={14} aria-hidden="true" /> Shared Procurement Swap Evaluation
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>SmartSwap Optimization Report</h2>
        <p style={{ color: '#64748b', marginTop: '12px', fontSize: '15px' }}>Original Procurement Query: <strong style={{ color: '#334155' }}>"{swapData.query}"</strong></p>
      </div>

      <OptimizationResult
        result={result}
        celebrationFallback="This plan is already fully optimized!"
        gridStyle={{ marginBottom: '40px' }}
      />

      <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Want to evaluate another supply chain choice or carbon plan?</p>
        <button type="button" onClick={() => navigate('/')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          Evaluate Your Own Plan with SmartSwap
        </button>
      </div>
    </div>
  );
}