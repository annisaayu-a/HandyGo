import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Clock, MessageCircle, Inbox } from 'lucide-react';
import './MitraLayout.css'; // We'll share some CSS or define our own for Mitra

export default function MitraLayout() {
  const location = useLocation();
  
  // Paths where bottom nav should be hidden if needed
  const hideBottomNavPaths = [
    // Add paths here if needed later (e.g. /mitra/chat, etc.)
  ];
  
  const shouldHideBottomNav = hideBottomNavPaths.includes(location.pathname);
  const isDashboard = location.pathname === '/mitra' || location.pathname === '/mitra/';

  return (
    <div className="mobile-app-container">
      <main 
        className="mobile-page-content animate-fade-in"
        style={{ 
          padding: isDashboard ? '0' : '24px 20px',
          paddingBottom: shouldHideBottomNav ? '0' : '80px' 
        }}
      >
        <Outlet />
      </main>

      {!shouldHideBottomNav && (
        <div className="bottom-nav-container">
          <nav className="bottom-nav">
            <Link to="/mitra" className={`nav-item ${location.pathname === '/mitra' ? 'active' : ''}`}>
              <Home size={22} />
            </Link>
            <Link to="/mitra/jobs" className={`nav-item ${location.pathname.includes('/jobs') ? 'active' : ''}`}>
              <Clock size={22} />
            </Link>
            <Link to="/mitra/messages" className={`nav-item ${location.pathname.includes('/messages') ? 'active' : ''}`}>
              <MessageCircle size={22} />
            </Link>
            <Link to="/mitra/profile" className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`}>
              <Inbox size={22} />
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
