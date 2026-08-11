import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MessageCircle, Star } from 'lucide-react';
import './ShoppingStatus.css';

export default function ShoppingStatus() {
  const navigate = useNavigate();
  const location = useLocation();

  const { pesanan = 'Ayam Bakar Paha Atas (2), Ayam Bakar Dada (4)', total = 88000, paymentMethod = 'Tunai', orderStatus: initialStatus = 'disiapkan' } = location.state || {};

  // State to simulate mitra changing order status ('disiapkan', 'diantar', 'selesai')
  const [orderStatus, setOrderStatus] = useState(initialStatus);
  
  // Rating state for 'selesai' step
  const [rating, setRating] = useState(0);
  
  const handleSelesaiClick = () => {
    if (orderStatus !== 'selesai') {
      navigate('/customer/shopping/payment', {
        state: { totalBiaya: total, method: paymentMethod.toLowerCase().includes('qris') ? 'qris' : 'tunai', pesanan }
      });
    }
  };

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
              <span className="eta-text">Telah sampai pada <strong>14:38</strong></span>
            ) : (
              <span className="eta-text">Akan sampai dalam <strong>14:29 - 14:44</strong></span>
            )}
          </div>
        </div>

        {/* Progress Tracker (Clickable for simulation) */}
        <div className="progress-tracker">
          <div className="progress-steps">
            <div className="step active" onClick={() => setOrderStatus('disiapkan')}>
              <div className="step-circle">1</div>
              <span className="step-label">Disiapkan</span>
            </div>
            
            <div className="step-dots">
              <div className={`dot ${orderStatus !== 'disiapkan' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus !== 'disiapkan' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus !== 'disiapkan' ? 'active-dot' : ''}`}></div>
            </div>

            <div className={`step ${orderStatus !== 'disiapkan' ? 'active' : ''}`} onClick={() => setOrderStatus('diantar')}>
              <div className="step-circle">2</div>
              <span className="step-label">Diantar</span>
            </div>

            <div className="step-dots">
              <div className={`dot ${orderStatus === 'selesai' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus === 'selesai' ? 'active-dot' : ''}`}></div>
              <div className={`dot ${orderStatus === 'selesai' ? 'active-dot' : ''}`}></div>
            </div>

            <div className={`step ${orderStatus === 'selesai' ? 'active' : ''}`} onClick={handleSelesaiClick}>
              <div className="step-circle">3</div>
              <span className="step-label">Selesai</span>
            </div>
          </div>
          
          {/* Status Message */}
          {orderStatus === 'disiapkan' && (
            <p className="status-message">Mohon menunggu pesananmu disiapkan dulu ya!</p>
          )}
          {orderStatus === 'diantar' && (
            <p className="status-message">Kurir sedang menuju ke lokasi kamu, pastikan titik pengantaran sudah sesuai ya!</p>
          )}
          {orderStatus === 'selesai' && (
            <div className="feedback-section">
              <p className="feedback-title">Bagaimana pengalamanmu tadi?</p>
              <input type="text" className="feedback-input" placeholder="Menyenangkan!" />
            </div>
          )}
        </div>

        {/* Dynamic Map for Diantar */}
        {orderStatus === 'diantar' && (
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

        {/* Courier Card */}
        <div className="courier-card">
          <div className="courier-info-left">
            <img 
              src="https://i.pravatar.cc/150?img=11" 
              alt="Courier Avatar" 
              className="courier-avatar"
            />
            <div className="courier-text">
              <h4 className="courier-name">Rafael gemam</h4>
              <div className="courier-rating">
                <span className="star">★</span> 4.9 <span className="reviews">(59 ulasan)</span>
              </div>
            </div>
          </div>
          {orderStatus !== 'selesai' && (
            <div className="courier-actions">
              <button className="courier-action-btn" onClick={() => navigate('/customer/call')}>
                <Phone size={18} color="#034078" fill="currentColor" />
              </button>
              <button className="courier-action-btn" onClick={() => navigate('/customer/chat')}>
                <MessageCircle size={18} color="#034078" fill="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Detail Pesanan or Rating */}
        {orderStatus !== 'selesai' ? (
          <div className="order-details-section">
            <h3 className="section-title">Detail Pesanan</h3>
            <p className="pesanan-text">{pesanan}</p>
          </div>
        ) : (
          <div className="rating-section">
            <h3 className="rating-title">Beri rating drivermu yuk!</h3>
            <div className="stars-container">
              {[1, 2, 3].map((star) => (
                <button 
                  key={star} 
                  className="star-btn"
                  onClick={() => setRating(star)}
                >
                  <Star 
                    size={40} 
                    fill={rating >= star ? "#fbbf24" : "#e2e8f0"} 
                    color={rating >= star ? "#fbbf24" : "#e2e8f0"} 
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
