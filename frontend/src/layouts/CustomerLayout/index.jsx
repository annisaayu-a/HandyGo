import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Clock, MessageCircle, Settings } from 'lucide-react';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const location = useLocation();
  
  // Paths where the bottom navigation SHOULD be visible
  const showBottomNavPaths = [
    '/customer',
    '/customer/',
    '/customer/history',
    '/customer/history/',
    '/customer/messages',
    '/customer/messages/',
    '/customer/settings',
    '/customer/settings/'
  ];
  const shouldHideBottomNav = !showBottomNavPaths.includes(location.pathname);

  return (
    <div className="mobile-app-container">
      <main 
        className="mobile-page-content animate-fade-in"
        style={{ paddingBottom: shouldHideBottomNav ? '24px' : '100px' }}
      >
        <Outlet />
      </main>

      {!shouldHideBottomNav && (
        <div className="bottom-nav-container">
        <nav className="bottom-nav">
          <Link to="/customer" className={`nav-item ${location.pathname === '/customer' ? 'active' : ''}`}>
            <Home size={22} />
          </Link>
          <Link to="/customer/history" className={`nav-item ${location.pathname.includes('/history') ? 'active' : ''}`}>
            <Clock size={22} />
          </Link>
          <Link to="/customer/messages" className={`nav-item ${location.pathname.includes('/messages') ? 'active' : ''}`}>
            <MessageCircle size={22} />
          </Link>
          <Link to="/customer/settings" className={`nav-item ${location.pathname.includes('/settings') ? 'active' : ''}`}>
            <Settings size={22} />
          </Link>
        </nav>
      </div>
      )}
    </div>
  );
}
