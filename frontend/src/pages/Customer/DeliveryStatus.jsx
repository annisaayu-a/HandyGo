import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MessageCircle, Star, CheckCircle2, Package } from 'lucide-react';
import './DeliveryStatus.css';
import './CompletedStatus.css';
import DriverTrackingMap from '../../components/DriverTrackingMap';

export default function DeliveryStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  // State to simulate mitra changing order status ('menuju', 'mengantar', 'selesai')
  const [orderStatus, setOrderStatus] = useState(location.state?.orderStatus || 'menuju');
  
  // Rating state for 'selesai' step
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (orderId) {
      const savedRatings = JSON.parse(localStorage.getItem('handyGoRatings') || '{}');
      if (savedRatings[orderId]) {
        setRating(savedRatings[orderId].rating || 0);
        setReview(savedRatings[orderId].review || '');
      }
    }
  }, [orderId]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (orderId) {
      const savedRatings = JSON.parse(localStorage.getItem('handyGoRatings') || '{}');
      savedRatings[orderId] = { ...savedRatings[orderId], rating: newRating, review };
      localStorage.setItem('handyGoRatings', JSON.stringify(savedRatings));
    }
  };

  const handleReviewChange = (e) => {
    const val = e.target.value;
    setReview(val);
    if (orderId) {
      const savedRatings = JSON.parse(localStorage.getItem('handyGoRatings') || '{}');
      savedRatings[orderId] = { ...savedRatings[orderId], rating, review: val };
      localStorage.setItem('handyGoRatings', JSON.stringify(savedRatings));
    }
  };

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
                fetch(`https://handygo-api.vercel.app/api/orders/${orderId}/status`, {
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
        </div>

        {/* Real-time Driver Tracking Map */}
        {orderStatus === 'mengantar' && (
          <div style={{ width: '100%', padding: '0 0 8px 0' }}>
            <DriverTrackingMap
              pickupCoords={
                location.state?.pickupLocation
                  ? { lat: location.state.pickupLocation.lat, lng: location.state.pickupLocation.lng }
                  : { lat: -5.165, lng: 119.431 }
              }
              dropoffCoords={
                location.state?.dropoffLocation
                  ? { lat: location.state.dropoffLocation.lat, lng: location.state.dropoffLocation.lng }
                  : { lat: -5.147, lng: 119.432 }
              }
              isActive={orderStatus === 'mengantar'}
              height="240px"
            />
          </div>
        )}

        {orderStatus === 'selesai' ? (
          <>
            {/* Success Banner */}
            <div className="completed-banner">
              <div className="completed-banner-text">
                <div className="completed-banner-title">
                  <CheckCircle2 size={20} /> Pesanan selesai!
                </div>
                <div className="completed-banner-subtitle">
                  Terima kasih telah menggunakan Handygo, cari kami kapan saja!
                </div>
              </div>
              <div className="completed-banner-icon">📦</div>
            </div>

            {/* Rincian Biaya Card */}
            <div className="cost-details-card">
              <h2 className="cost-details-title">Rincian Biaya</h2>
              <div className="cost-row">
                <span className="cost-label">Biaya Pengiriman</span>
                <span className="cost-value">Rp 23.000</span>
              </div>
              <div className="cost-row">
                <span className="cost-label">Biaya Layanan</span>
                <span className="cost-value">Rp 7.000</span>
              </div>
              <hr className="cost-divider" />
              <div className="cost-total-row">
                <span>Total</span>
                <span className="cost-total-value">Rp 30.000</span>
              </div>
            </div>
            
            {/* Courier Card (Disabled) */}
            <div className="courier-card">
              <div className="courier-info-left">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                  alt="Courier Avatar" 
                  className="courier-avatar"
                />
                <div className="courier-text">
                  <h4 className="courier-name">Rafael gemam</h4>
                  <div className="courier-rating">
                    <span className="star" style={{color: '#fbbf24'}}>★</span> 4.9 <span className="reviews" style={{color: '#64748b'}}>(59 ulasan)</span>
                  </div>
                </div>
              </div>
              <div className="courier-actions">
                <button className="courier-action-btn" onClick={() => navigate('/customer/call')}>
                  <Phone size={24} color="#034078" fill="#034078" />
                </button>
                <button className="courier-action-btn" onClick={() => navigate('/customer/chat')}>
                  <MessageCircle size={24} color="#034078" fill="#034078" />
                </button>
              </div>
            </div>

            {/* Rating Section */}
            <div className="rating-section-new">
              <h3 className="rating-title-new">Bagaimana pengalamanmu tadi?</h3>
              <div className="stars-container-new">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill={star <= rating ? '#fbbf24' : '#e2e8f0'} 
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => handleRatingChange(star)}
                    className="star-icon"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>
              <textarea 
                className="review-input-new"
                placeholder="Tulis ulasan di sini"
                rows="2"
                value={review}
                onChange={handleReviewChange}
              />
              {rating > 0 && (
                <button 
                  className="submit-rating-btn"
                  onClick={() => navigate('/customer')}
                >
                  Kirim Rating
                </button>
              )}
            </div>
          </>
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
                <div className="courier-rating">
                    <span className="star" style={{color: '#fbbf24'}}>★</span> 4.9 <span className="reviews" style={{color: '#64748b'}}>(59 ulasan)</span>
                </div>
              </div>
            </div>
            <div className="courier-actions">
              <button className="icon-btn-round" onClick={() => navigate('/customer/call')}><Phone size={24} color="#034078" fill="#034078" /></button>
              <button className="icon-btn-round" onClick={() => navigate('/customer/chat')}>
                <MessageCircle size={24} color="#034078" fill="#034078" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
