import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingDown, Zap, Shield } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function LandingPage() {
  const navigate = useNavigate();
  useDocumentTitle('SmartSwap — Sustainable Consumer Choices');

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

      <section aria-labelledby="features-heading" style={{ marginTop: '40px' }}>
        <h2 id="features-heading" className="visually-hidden">Platform features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', textAlign: 'left' }}>
          <article style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#16a34a', marginBottom: '14px' }}><Zap size={28} fill="#16a34a" style={{ opacity: 0.2 }} aria-hidden="true" /></div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Pre-Consumption Intercept</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', lineHeight: '1.5' }}>Don't just track carbon footprint after the damage is done. Swap your purchasing plans for cleaner options before spending a single rupee.</p>
          </article>
          <article style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#2563eb', marginBottom: '14px' }}><Shield size={28} fill="#2563eb" style={{ opacity: 0.2 }} aria-hidden="true" /></div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Secure Private Accounts</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', lineHeight: '1.5' }}>Your procurement data is guarded behind full user profiles, creating a permanent, audit-ready log of your historical climate contributions.</p>
          </article>
          <article style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#7c3aed', marginBottom: '14px' }}><TrendingDown size={28} style={{ color: '#7c3aed' }} aria-hidden="true" /></div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Dynamic INR Optimization</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', lineHeight: '1.5' }}>Powered directly by generative AI to cross-reference market costs, ensuring ecological alternatives remain highly competitive.</p>
          </article>
        </div>
      </section>
    </div>
  );
}