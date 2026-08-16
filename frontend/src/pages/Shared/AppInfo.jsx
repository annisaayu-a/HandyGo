import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './AppInfo.css';

export default function AppInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMitra = location.pathname.startsWith('/mitra');
  const backPath = isMitra ? '/mitra/profile' : '/customer/settings';

  return (
    <div className="appinfo-container animate-fade-in">
      <div className="appinfo-header">
        <button className="appinfo-back-btn" onClick={() => navigate(backPath)}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <h1 className="appinfo-title">Informasi Aplikasi</h1>
      </div>

      <div className="appinfo-content">
        {/* App Logo & Name */}
        <div className="appinfo-logo-row">
          <div className="appinfo-logo">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="52" height="52" rx="14" fill="#034078" />
              <text x="26" y="34" textAnchor="middle" fontSize="26" fill="white" fontWeight="bold">H</text>
            </svg>
          </div>
          <div className="appinfo-name-col">
            <h2 className="appinfo-app-name">HandyGo</h2>
            <p className="appinfo-version">Versi 1.0.0</p>
          </div>
        </div>

        {/* Description */}
        <p className="appinfo-description">
          HandyGo adalah aplikasi yang membantu kamu memenuhi berbagai kebutuhan sehari-hari 
          melalui layanan dari mitra terpercaya, mulai dari belanja, antar barang, bersih-bersih, 
          perbaikan, pindahan, hingga antar jemput.
        </p>
      </div>
    </div>
  );
}
