import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import './PartnerStatus.css';

export default function PartnerStatus() {
  const navigate = useNavigate();

  const isReturned = localStorage.getItem('hasReturnedToWelcome') === 'true';

  return (
    <div className="partner-status-container animate-fade-in">
      {/* Decorative Background Elements */}
      <div className="ps-bg-star">
        <svg viewBox="0 0 200 200" fill="#f1f5f9" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 0 L122.45 69.1 L195.11 69.1 L136.33 111.8 L158.78 180.9 L100 138.2 L41.22 180.9 L63.67 111.8 L4.89 69.1 L77.55 69.1 Z" />
        </svg>
      </div>
      <div className="ps-bg-circle"></div>

      <div className="pstat-header">
        <p className="pstat-subtitle">Status Dokumen</p>
        <h1 className="pstat-title">
          Pendaftaran Mitra<br/>HandyGo
        </h1>
      </div>

      <div className="pstat-content">
        <div className="pstat-card">
          <p className="pstat-card-desc">
            Dokumen kamu sudah terkirim dan lagi dalam tahap verifikasi nih
          </p>
          
          <div className="pstat-item">
            <div className="pstat-item-left">
              <div className="pstat-icon-wrapper" style={{ position: 'relative' }}>
                <FileText size={20} color="#ffffff" />
                {/* Checkmark indicator for verified */}
                {isReturned && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4, 
                    background: '#22c55e', borderRadius: '50%', 
                    width: 14, height: 14, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>
                    <span style={{ color: '#fff', fontSize: '9px', fontWeight: 'bold' }}>✓</span>
                  </div>
                )}
              </div>
              <span className="pstat-item-label">Data Diri</span>
            </div>
            {isReturned ? (
              <div className="pstat-badge success">Terverifikasi</div>
            ) : (
              <div className="pstat-badge">Sedang diproses</div>
            )}
          </div>

          <div className="pstat-divider"></div>

          <div className="pstat-item">
            <div className="pstat-item-left">
              <div className="pstat-icon-wrapper" style={{ position: 'relative' }}>
                <FileText size={20} color="#ffffff" />
                {isReturned && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4, 
                    background: '#22c55e', borderRadius: '50%', 
                    width: 14, height: 14, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>
                    <span style={{ color: '#fff', fontSize: '9px', fontWeight: 'bold' }}>✓</span>
                  </div>
                )}
              </div>
              <span className="pstat-item-label">Dokumen</span>
            </div>
            {isReturned ? (
              <div className="pstat-badge success">Terverifikasi</div>
            ) : (
              <div className="pstat-badge">Sedang diproses</div>
            )}
          </div>
        </div>
        
        {isReturned && (
          <p className="pstat-final-step-text animate-fade-in">
            Satu langkah terakhir lagi untuk mengaktifkan akunmu!
          </p>
        )}
      </div>

      <div className="pstat-bottom-action">
        {isReturned ? (
          <button 
            className="pstat-kembali-btn"
            onClick={() => navigate('/partner-attribute')}
          >
            Lanjutkan
          </button>
        ) : (
          <button 
            className="pstat-kembali-btn"
            onClick={() => navigate('/partner-welcome')}
          >
            Kembali
          </button>
        )}
      </div>
    </div>
  );
}
