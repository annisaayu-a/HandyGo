import { Outlet, Link } from 'react-router-dom';
import { Home, ClipboardList, User } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function CustomerLayout() {
  return (
    <div className="app-container">
      <div className="main-content">
        <header className="topbar">
          <div className="brand" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="HandyGo Logo" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link to="/customer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <Home size={18} /> Beranda
            </Link>
            <Link to="/customer/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <ClipboardList size={18} /> Pesanan Saya
            </Link>
            <Link to="/customer/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <User size={18} /> Profil
            </Link>
          </nav>
        </header>
        <main className="page-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
