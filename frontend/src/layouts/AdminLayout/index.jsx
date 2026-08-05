import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Settings, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function AdminLayout() {
  return (
    <div className="app-container">
      <aside className="sidebar" style={{ backgroundColor: '#0f172a', color: 'white', borderRight: 'none' }}>
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logo} alt="HandyGo Logo" style={{ height: '36px', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '600' }}>Admin</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: '#cbd5e1' }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/customers" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: '#cbd5e1' }}>
            <Users size={20} /> Data Customer
          </Link>
          <Link to="/admin/mitras" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: '#cbd5e1' }}>
            <UserCog size={20} /> Data Mitra
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '16px' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: '#f87171' }}>
            <LogOut size={20} /> Logout
          </Link>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div style={{ fontWeight: '600', fontSize: '1.2rem' }}>Administrator Panel</div>
        </header>
        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
