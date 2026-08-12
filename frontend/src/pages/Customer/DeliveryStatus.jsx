import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MessageCircle, Star, CheckCircle, Package } from 'lucide-react';
import './DeliveryStatus.css';

export default function DeliveryStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  // State to simulate mitra changing order status ('menuju', 'mengantar', 'selesai')
  const [orderStatus, setOrderStatus] = useState('menuju');
  
  // Rating state for 'selesai' step
  const [rating, setRating] = useState(0);

  // Dynamic ETA
  const [eta, setEta] = useState({ start: '', end: '', arrived: '' });

  useEffect(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 15 * 60000);
    const endTime = new Date(now.getTime() + 30 * 60000);
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    };

    setEta({
      start: formatTime(startTime),
      end: formatTime(endTime),
      arrived: formatTime(now) // just for demo when finished
    });
  }, []);

  return (
    <div className="shopping-status-page animate-fade-in">
      {/* Header */}
      <header className="status-header">
        <button className="back-btn" onClick={() => navigate('/customer')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="status-title">Pesananmu</h1>
      </header>

      <main className="status-content">
        {/* ETA Badge */}
        <div className="eta-badge-container">
          <div className="eta-badge">
            {orderStatus === 'selesai' ? (
              <span className="eta-text">Telah sampai pada <strong>{eta.arrived}</strong></span>
            ) : (
              <span className="eta-text">Akan sampai dalam <strong>{eta.start} - {eta.end}</strong></span>
            )}
          </div>
        </div>

        {/* Progress Tracker (Clickable for simulation) */}
        <div className="progress-tracker">
          <div className="progress-steps">
            <div className="step active" onClick={() => setOrderStatus('menuju')}>
              <div className="step-circle">1</div>
              <span className="step-label">Menuju Lokasi</span>
            </div>
            
            <div className="step-dots">
              <div className={`dot ${orderStatus !== 'menuju' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus !== 'menuju' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus !== 'menuju' ? 'active-dot' : ''}`}></div>
            </div>

            <div className={`step ${orderStatus !== 'menuju' ? 'active' : ''}`} onClick={() => setOrderStatus('mengantar')}>
              <div className="step-circle">2</div>
              <span className="step-label">Mengantar</span>
            </div>

            <div className="step-dots">
              <div className={`dot ${orderStatus === 'selesai' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus === 'selesai' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus === 'selesai' ? 'active-dot' : ''}`}></div>
            </div>

            <div className={`step ${orderStatus === 'selesai' ? 'active' : ''}`} onClick={() => {
              setOrderStatus('selesai');
              if (orderId && orderStatus !== 'selesai') {
                fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'selesai' })
                }).catch(e => console.error(e));
              }
            }}>
              <div className="step-circle">3</div>
              <span className="step-label">Selesai</span>
            </div>
          </div>
          
          {/* Status Message */}
          {orderStatus === 'menuju' && (
            <p className="status-message">Kurir sedang menuju lokasi penjemputan.</p>
          )}
          {orderStatus === 'mengantar' && (
            <p className="status-message">Paket sedang dalam perjalanan.</p>
          )}
          {orderStatus === 'selesai' && (
            <div className="success-banner">
              <div className="success-banner-content">
                <CheckCircle size={20} color="#22c55e" fill="#dcfce7" />
                <div>
                  <h4 className="success-banner-title">Pesanan selesai!</h4>
                  <p className="success-banner-text">Terima kasih telah menggunakan Handygo, cari kami kapan saja!</p>
                </div>
              </div>
              <div className="success-banner-icon">
                <Package size={32} color="#854d0e" />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Map for Mengantar */}
        {orderStatus === 'mengantar' && (
          <div className="tracking-map-container">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
              alt="Map Route" 
              className="tracking-map-img"
            />
            {/* Overlay to make map look like route map */}
            <div className="tracking-map-overlay">
              <svg viewBox="0 0 100 100" className="route-line" preserveAspectRatio="none">
                <path d="M 80 20 L 50 50 L 55 70 L 30 80" fill="none" stroke="#034078" strokeWidth="3" strokeDasharray="5,5" />
                <circle cx="80" cy="20" r="4" fill="#034078" />
                <circle cx="30" cy="80" r="4" fill="#1e293b" />
              </svg>
            </div>
          </div>
        )}

        {/* Detail Pesanan or Rating */}
        {orderStatus === 'selesai' ? (
          <div className="post-order-details">
            <div className="receipt-card">
              <h3 className="receipt-title">Rincian Biaya</h3>
              <div className="receipt-row">
                <span>Biaya Pengiriman</span>
                <span>Rp 23.000</span>
              </div>
              <div className="receipt-row">
                <span>Biaya Layanan</span>
                <span>Rp 7.000</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-total-row">
                <span>Total</span>
                <span>Rp 30.000</span>
              </div>
            </div>
            
            {/* Courier Card (Repeated for 'selesai') */}
            <div className="courier-card" style={{ marginTop: '24px' }}>
              <div className="courier-info-left">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                  alt="Courier Avatar" 
                  className="courier-avatar"
                />
                <div className="courier-text">
                  <h4 className="courier-name">Rafael gemam</h4>
                  <p className="courier-subtitle"><Star size={12} fill="#fbbf24" color="#fbbf24" /> 4.9 (59 ulasan)</p>
                </div>
              </div>
              <div className="courier-actions">
                <button className="icon-btn-round" onClick={() => navigate('/customer/call')}><Phone size={18} color="#034078" /></button>
                <button className="icon-btn-round" onClick={() => navigate('/customer/chat', { state: { isFinished: true } })}>
                  <MessageCircle size={18} color="#034078" />
                </button>
              </div>
            </div>

            <div className="rating-section" style={{ marginTop: '24px' }}>
              <h3 className="rating-title">Bagaimana pengalamanmu tadi?</h3>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    className="star-btn"
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      size={32} 
                      fill={rating >= star ? "#fbbf24" : "#e2e8f0"} 
                      color={rating >= star ? "#fbbf24" : "#e2e8f0"} 
                    />
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '16px' }}>
                <input type="text" className="feedback-input" placeholder="Tulis ulasan di sini" />
              </div>
            </div>
          </div>
        ) : (
          <div className="courier-card">
            <div className="courier-info-left">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                alt="Courier Avatar" 
                className="courier-avatar"
              />
              <div className="courier-text">
                <h4 className="courier-name">Rafael gemam</h4>
                <p className="courier-subtitle"><Star size={12} fill="#fbbf24" color="#fbbf24" /> 4.9 (59 ulasan)</p>
              </div>
            </div>
            <div className="courier-actions">
              <button className="icon-btn-round" onClick={() => navigate('/customer/call')}><Phone size={18} color="#034078" /></button>
              <button className="icon-btn-round" onClick={() => navigate('/customer/chat')}>
                <MessageCircle size={18} color="#034078" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
