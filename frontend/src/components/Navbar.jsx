
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export function Navbar({ auth, onLogout }) {
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
              Logout <LogOut size={14} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', background: '#0f172a', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Operator Login</Link>
        )}
      </div>
    </nav>
  );
}