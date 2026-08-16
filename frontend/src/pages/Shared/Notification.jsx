import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import './Notification.css';

export default function Notification() {
  const navigate = useNavigate();

  return (
    <div className="notif-page animate-fade-in">
      <div className="notif-header">
        <button className="notif-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="notif-title">Notifikasi</h1>
      </div>

      <div className="notif-content">
        <div className="notif-empty-state">
          <div className="notif-icon-wrapper">
            <Clock size={48} color="#ffffff" strokeWidth={3} />
          </div>
          <h2 className="notif-empty-title">Tidak ada notifikasi</h2>
          <p className="notif-empty-subtitle">Coba kembali lagi nanti</p>
        </div>
      </div>
    </div>
  );
}
