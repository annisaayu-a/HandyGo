import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';
import './ShoppingStatus.css';
import './CompletedStatus.css';

export default function ShoppingStatus() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = location.state || {};
  const orderId = stateData.orderId;
  const initialStatus = stateData.orderStatus || stateData.status || 'disiapkan';
  const paymentMethod = stateData.paymentMethod || 'Tunai';

  // Handle both Checkout (string) and History (object)
  let pesananText = 'Ayam Bakar Paha Atas (2), Ayam Bakar Dada (4)';
  let total = 88000;

  if (stateData.pesanan) {
    if (typeof stateData.pesanan === 'string') {
      pesananText = stateData.pesanan;
      total = stateData.total || 88000;
    } else {
      pesananText = stateData.pesanan.order_details || pesananText;
      total = stateData.pesanan.estimated_price || stateData.total || 88000;
    }
  }
  // State to simulate mitra changing order status ('disiapkan', 'diantar', 'selesai')
  const [orderStatus, setOrderStatus] = useState(initialStatus);
  
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
  
  const handleSelesaiClick = () => {
    if (orderStatus !== 'selesai') {
      navigate('/customer/shopping/payment', {
        state: { totalBiaya: total, method: paymentMethod.toLowerCase().includes('qris') ? 'qris' : 'tunai', pesanan: pesananText, orderId }
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
              <span className="eta-text">Telah sampai pada <strong>{eta.arrived}</strong></span>
            ) : (
              <span className="eta-text">Akan sampai dalam <strong>{eta.start} - {eta.end}</strong></span>
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
        </div>
          
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
              <div className="completed-banner-icon">🛍️</div>
            </div>

            {/* Rincian Biaya Card */}
            <div className="cost-details-card">
              <h2 className="cost-details-title">Rincian Biaya</h2>
              <div className="cost-row">
                <span className="cost-label">Barang</span>
                <span className="cost-value">Rp {Math.max(0, total - 10000).toLocaleString('id-ID')}</span>
              </div>
              <div className="cost-row">
                <span className="cost-label">Biaya Pengantaran</span>
                <span className="cost-value">Rp 10.000</span>
              </div>
              <hr className="cost-divider" />
              <div className="cost-total-row">
                <span>Total</span>
                <span className="cost-total-value">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Courier Card (Disabled) */}
            <div className="courier-card">
              <div className="courier-info-left">
                <img src="https://i.pravatar.cc/150?img=11" alt="Courier Avatar" className="courier-avatar" />
                <div className="courier-text">
                  <h4 className="courier-name">Rafael gemam</h4>
                  <div className="courier-rating">
                    <span className="star">★</span> 4.9 <span className="reviews">(59 ulasan)</span>
                  </div>
                </div>
              </div>
              <div className="courier-actions">
                <button className="courier-action-btn disabled">
                  <Phone size={18} color="#94a3b8" fill="currentColor" />
                </button>
                <button className="courier-action-btn disabled">
                  <MessageCircle size={18} color="#94a3b8" fill="currentColor" />
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
          <>
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

            {/* Courier Card (Active) */}
            <div className="courier-card">
              <div className="courier-info-left">
                <img src="https://i.pravatar.cc/150?img=11" alt="Courier Avatar" className="courier-avatar" />
                <div className="courier-text">
                  <h4 className="courier-name">Rafael gemam</h4>
                  <div className="courier-rating">
                    <span className="star">★</span> 4.9 <span className="reviews">(59 ulasan)</span>
                  </div>
                </div>
              </div>
              <div className="courier-actions">
                <button className="courier-action-btn" onClick={() => navigate('/customer/call')}>
                  <Phone size={18} color="#034078" fill="currentColor" />
                </button>
                <button className="courier-action-btn" onClick={() => navigate('/customer/chat')}>
                  <MessageCircle size={18} color="#034078" fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Detail Pesanan */}
            <div className="order-details-section">
              <h3 className="section-title">Detail Pesanan</h3>
              <p className="pesanan-text">{pesananText}</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
