import { Outlet, Link } from 'react-router-dom';
import { Briefcase, List, UserCheck, Settings, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function MitraLayout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logo} alt="HandyGo Logo" style={{ height: '36px', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '600' }}>Mitra</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <Link to="/mitra" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: 'var(--text-main)' }}>
            <Briefcase size={20} /> Dashboard
          </Link>
          <Link to="/mitra/jobs" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: 'var(--text-main)' }}>
            <List size={20} /> Pekerjaan Tersedia
          </Link>
          <Link to="/mitra/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: 'var(--text-main)' }}>
            <UserCheck size={20} /> Profil Saya
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: 'var(--danger)' }}>
            <LogOut size={20} /> Keluar
          </Link>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar" style={{ justifyContent: 'flex-end' }}>
          <div style={{ fontWeight: '500' }}>Halo, Mitra Budi</div>
        </header>
        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
