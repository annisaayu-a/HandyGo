import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Clock, MessageCircle, Settings } from 'lucide-react';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const location = useLocation();
  
  // Paths where the bottom navigation should be hidden
  const hideBottomNavPaths = [
    '/customer/shopping', 
    '/customer/shopping/map', 
    '/customer/shopping/details', 
    '/customer/shopping/checkout',
    '/customer/shopping/status',
    '/customer/shopping/payment',
    '/customer/shopping/location',
    '/customer/cleaning',
    '/customer/cleaning/map',
    '/customer/cleaning/checkout',
    '/customer/cleaning/status',
    '/customer/cleaning/payment',
    '/customer/chat',
    '/customer/call',
    '/customer/location',
    '/customer/search-location',
    '/customer/profile',
    '/customer/search',
    '/customer/delivery',
    '/customer/delivery/location',
    '/customer/delivery/details',
    '/customer/delivery/receiver',
    '/customer/delivery/sender',
    '/customer/delivery/checkout',
    '/customer/delivery/status',
    '/customer/delivery/map',
    '/customer/repair',
    '/customer/repair/map',
    '/customer/repair/checkout',
    '/customer/repair/details',
    '/customer/repair/status',
    '/customer/repair/payment',
    '/customer/transport',
    '/customer/transport/location',
    '/customer/transport/map',
    '/customer/transport/details',
    '/customer/transport/payment',
    '/customer/transport/qris'
  ];
  const shouldHideBottomNav = hideBottomNavPaths.includes(location.pathname);

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
