import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, FileText, Clock, Wallet, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CleaningStatus.css';
import './CompletedStatus.css';

export default function CleaningStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData || {
    address: 'BTP Blok G 114',
    luasArea: '50 - 100 m²',
    tingkatKekotoran: 'Sedang',
    durasi: 3,
    catatan: 'Kamar utama tidak usah'
  };

  const initialStep = location.state?.orderStatus === 'selesai' || location.state?.status === 'selesai' ? 3 : 1;
  const [activeStep, setActiveStep] = useState(initialStep);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const orderId = location.state?.orderId;
  const isPaid = location.state?.isPaid || false;

  useEffect(() => {
    if (orderId) {
      const savedRatings = JSON.parse(localStorage.getItem('handyGoRatings') || '{}');
      if (savedRatings[orderId]) {
        setRating(savedRatings[orderId].rating || 0);
        setReviewText(savedRatings[orderId].review || '');
      }
    }
  }, [orderId]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (orderId) {
      const savedRatings = JSON.parse(localStorage.getItem('handyGoRatings') || '{}');
      savedRatings[orderId] = { ...savedRatings[orderId], rating: newRating, review: reviewText };
      localStorage.setItem('handyGoRatings', JSON.stringify(savedRatings));
    }
  };

  const handleReviewChange = (e) => {
    const val = e.target.value;
    setReviewText(val);
    if (orderId) {
      const savedRatings = JSON.parse(localStorage.getItem('handyGoRatings') || '{}');
      savedRatings[orderId] = { ...savedRatings[orderId], rating, review: val };
      localStorage.setItem('handyGoRatings', JSON.stringify(savedRatings));
    }
  };

  // Dynamic ETA
  const [eta, setEta] = useState({ arriveStart: '', arriveEnd: '', finishStart: '', finishEnd: '', finished: '', started: '' });

  useEffect(() => {
    const now = new Date();
    const aStart = new Date(now.getTime() + 15 * 60000);
    const aEnd = new Date(now.getTime() + 20 * 60000);
    const fStart = new Date(now.getTime() + 180 * 60000); // Approx 3 hours
    const fEnd = new Date(now.getTime() + 200 * 60000);
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    };

    setEta({
      arriveStart: formatTime(aStart),
      arriveEnd: formatTime(aEnd),
      finishStart: formatTime(fStart),
      finishEnd: formatTime(fEnd),
      finished: formatTime(fStart),
      started: formatTime(aEnd)
    });
  }, []);

  // Auto-progress steps for demonstration
  useEffect(() => {
    if (initialStep >= 3) return;
    
    const timer1 = setTimeout(() => setActiveStep(2), 5000);
    // After 15 seconds, transition to step 3 (finished)
    const timer2 = setTimeout(() => setActiveStep(3), 15000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [initialStep]);

  useEffect(() => {
    let interval = null;
    if (activeStep === 2) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeStep]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const pesanan = location.state?.pesanan;
  const totalBiaya = pesanan?.estimated_price || location.state?.totalPrice || 158000;
  const berjalanBiaya = Math.floor(elapsedSeconds / 60) * 1000;
  const biayaLayanan = totalBiaya - berjalanBiaya; // For visual breakdown if needed

  const getStepText = () => {
    if (activeStep === 1) return 'Petugas sedang menuju lokasi.';
    if (activeStep === 2) return 'Petugas sedang membersihkan area.';
    if (activeStep === 3) return 'Pekerjaan telah selesai.';
    return '';
  };

  return (
    <div className="cleaning-status-page animate-fade-in">
      {/* Header */}
      <header className="cs-header">
        <button className="cs-back-btn" onClick={() => navigate('/customer/history')}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="cs-title">Pesananmu</h1>
      </header>

      <div className="cs-content">
        {/* Arrival/Complete Time */}
        <div className="cs-arrival-pill">
          {activeStep === 1 && <>Akan sampai pada <span className="fw-bold">{eta.arriveStart} - {eta.arriveEnd}</span></>}
          {activeStep === 2 && <>Akan selesai pada <span className="fw-bold">{eta.finishStart} - {eta.finishEnd}</span></>}
          {activeStep === 3 && <>Telah selesai pada <span className="fw-bold">{eta.finished}</span></>}
        </div>

        {/* Stepper */}
        <div className="cs-stepper-container">
          <div className="cs-stepper-track">
            <div className={`cs-stepper-line ${activeStep >= 2 ? 'active' : ''}`} style={{ left: '16%', right: '50%' }}></div>
            <div className={`cs-stepper-line ${activeStep >= 3 && isPaid ? 'active' : ''}`} style={{ left: '50%', right: '16%' }}></div>
          </div>
          
          <div className="cs-steps">
            <div className={`cs-step ${activeStep >= 1 ? 'active' : ''}`}>
              <div className="cs-step-circle">1</div>
              <div className="cs-step-label">Menuju Lokasi</div>
            </div>
            <div className={`cs-step ${activeStep >= 2 ? 'active' : ''}`}>
              <div className="cs-step-circle">2</div>
              <div className="cs-step-label">Membersihkan</div>
            </div>
            <div className={`cs-step ${activeStep >= 3 && isPaid ? 'active' : ''}`}>
              <div className="cs-step-circle">3</div>
              <div className="cs-step-label">Selesai</div>
            </div>
          </div>
          <p className="cs-step-desc">{getStepText()}</p>
        </div>

        {/* Divider */}
        <div className="cs-divider"></div>

        {/* --- STEP 3: PAYMENT SCREEN --- */}
        {activeStep === 3 && (
          <div className="cs-payment-screen">
            {!isPaid ? (
              <>
                {/* Unpaid Selesai State */}
                <div className="completed-banner" style={{backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0'}}>
                  <div className="completed-banner-text">
                    <div className="completed-banner-title" style={{color: '#15803d'}}>
                      <CheckCircle2 size={20} color="#15803d" /> Pekerjaan Selesai
                    </div>
                    <div className="completed-banner-subtitle">
                      Silahkan lakukan pembayaran untuk menyelesaikan pesanan
                    </div>
                  </div>
                  <div className="completed-banner-icon">🧹</div>
                </div>

                {/* Final Duration Card */}
                <div className="cs-live-card" style={{marginBottom: '24px', backgroundColor: '#034078'}}>
                  <div className="cs-live-inner-card" style={{border: 'none', background: 'transparent', padding: '0', margin: 0}}>
                    <div className="cs-live-row" style={{justifyContent: 'flex-start', gap: 8, color: '#f8fafc', marginBottom: '8px'}}>
                      <Clock size={16} />
                      <span style={{color: '#f8fafc'}}>Durasi pengerjaan</span>
                    </div>
                    <div className="cs-live-time" style={{fontSize: '2.5rem', color: '#ffffff', margin: '16px 0', fontWeight: 600}}>
                      {formatTime(elapsedSeconds)}
                    </div>
                    <div className="cs-live-subtext" style={{color: '#cbd5e1', fontSize: '0.85rem'}}>
                      {eta.started} - {eta.finished} WITA
                    </div>
                  </div>
                </div>

                {/* Rincian Biaya */}
                <div className="cost-details-card">
                  <h2 className="cost-details-title">Rincian Biaya</h2>
                  <div className="cost-row">
                    <span className="cost-label">Tarif Bersih-bersih</span>
                    <span className="cost-value">Rp {berjalanBiaya.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="cost-row">
                    <span className="cost-label">Biaya Layanan</span>
                    <span className="cost-value">Rp {biayaLayanan.toLocaleString('id-ID')}</span>
                  </div>
                  <hr className="cost-divider" />
                  <div className="cost-total-row">
                    <span>Total</span>
                    <span className="cost-total-value">Rp {totalBiaya.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="cs-payment-methods">
                  <h2 className="cs-card-title" style={{ marginTop: 8, fontSize: '0.95rem' }}>Pilih Metode Pembayaran</h2>
                  
                  <div 
                    className={`cs-payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="cs-payment-icon">
                      <Wallet size={20} color="#034078" />
                    </div>
                    <div className="cs-payment-name">Bayar di tempat</div>
                    <div className={`cs-radio-btn ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      {paymentMethod === 'cash' && <div className="cs-radio-inner"></div>}
                    </div>
                  </div>

                  <div 
                    className={`cs-payment-option ${paymentMethod === 'qris' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('qris')}
                  >
                    <div className="cs-payment-icon">
                      <div style={{fontWeight: 'bold', color: '#034078', fontSize: '0.7rem'}}>QRIS</div>
                    </div>
                    <div className="cs-payment-name">QRIS</div>
                    <div className={`cs-radio-btn ${paymentMethod === 'qris' ? 'selected' : ''}`}>
                      {paymentMethod === 'qris' && <div className="cs-radio-inner"></div>}
                    </div>
                  </div>
                </div>

                <button 
                  className="cs-pay-btn" 
                  disabled={!paymentMethod}
                  onClick={() => navigate('/customer/cleaning/payment', { state: { totalBiaya, method: paymentMethod, orderData, orderId } })}
                >
                  Bayar Sekarang
                </button>
              </>
            ) : (
              <>
                {/* Paid Selesai State */}
                <div className="completed-banner">
                  <div className="completed-banner-text">
                    <div className="completed-banner-title">
                      <CheckCircle2 size={20} /> Layanan selesai!
                    </div>
                    <div className="completed-banner-subtitle">
                      Terima kasih telah menggunakan Handygo, cari kami kapan saja!
                    </div>
                  </div>
                  <div className="completed-banner-icon">🧹</div>
                </div>

                {/* Rincian Biaya */}
                <div className="cost-details-card">
                  <h2 className="cost-details-title">Rincian Biaya</h2>
                  <div className="cost-row">
                    <span className="cost-label">Tarif Bersih-bersih</span>
                    <span className="cost-value">Rp {berjalanBiaya.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="cost-row">
                    <span className="cost-label">Biaya Layanan</span>
                    <span className="cost-value">Rp {biayaLayanan.toLocaleString('id-ID')}</span>
                  </div>
                  <hr className="cost-divider" />
                  <div className="cost-total-row">
                    <span>Total</span>
                    <span className="cost-total-value">Rp {totalBiaya.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Courier Card (Disabled) */}
                <div className="courier-card" style={{ marginBottom: '24px' }}>
                  <div className="courier-info-left">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Mitra" className="courier-avatar" />
                    <div className="courier-text">
                      <h4 className="courier-name">Rafael gemam</h4>
                      <div className="courier-rating">
                        <span className="star">★</span> 4.9 <span className="reviews">(59 ulasan)</span>
                      </div>
                    </div>
                  </div>
                    <div className="courier-actions">
                      <button className="courier-action-btn" onClick={() => navigate('/customer/call')}>
                        <Phone size={18} color="#034078" />
                      </button>
                      <button className="courier-action-btn" onClick={() => navigate('/customer/chat')}>
                        <MessageCircle size={18} color="#034078" />
                      </button>
                    </div>
                </div>

                {/* Rating Box */}
                <div className="rating-section-new">
                  <h3 className="rating-title-new">Bagaimana pengalamanmu tadi?</h3>
                  <div className="stars-container-new">
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg 
                        key={i} 
                        width="40" 
                        height="40" 
                        viewBox="0 0 24 24" 
                        fill={i <= rating ? '#fbbf24' : '#e2e8f0'} 
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => handleRatingChange(i)}
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
                    value={reviewText}
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
            )}
          </div>
        )}

        {/* --- STEP 1 & 2: LIVE TRACKING --- */}
        {activeStep < 3 && (
          <>
            {/* Live Service Card (Step 2) */}
        {activeStep >= 2 && (
          <div className="cs-live-card">
            <h2 className="cs-live-title">Live Service</h2>
            
            <div className="cs-live-inner-card">
              <div className="cs-live-row">
                <Clock size={16} color="#94a3b8" />
                <span className="cs-live-label">Durasi pengerjaan</span>
              </div>
              <div className="cs-live-time">{formatTime(elapsedSeconds)}</div>
              <div className="cs-live-subtext">Dimulai pada {eta.started} WITA</div>
              <div className="cs-live-subtext">+1.000 setiap menit</div>
            </div>

            <div className="cs-live-inner-card">
              <div className="cs-live-row">
                <Wallet size={16} color="#94a3b8" />
                <span className="cs-live-label">Total Berjalan</span>
              </div>
              <div className="cs-live-price">Rp {berjalanBiaya.toLocaleString('id-ID')}</div>
              <div className="cs-live-subtext">Rp 60.000/Jam</div>
              <div className="cs-live-subtext">Diperbarui otomatis</div>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        <div className="cs-card">
          <h2 className="cs-card-title">Detail Pesanan</h2>
          
          <div className="cs-detail-row">
            <span className="cs-detail-label">Lokasi</span>
            <span className="cs-detail-value">{orderData.address}</span>
          </div>
          <div className="cs-detail-row">
            <span className="cs-detail-label">Luas Area</span>
            <span className="cs-detail-value">{orderData.luasArea}</span>
          </div>
          <div className="cs-detail-row">
            <span className="cs-detail-label">Tingkat Kekotoran</span>
            <span className="cs-detail-value">{orderData.tingkatKekotoran}</span>
          </div>
          <div className="cs-detail-row">
            <span className="cs-detail-label">Estimasi Durasi</span>
            <span className="cs-detail-value">{orderData.durasi} jam</span>
          </div>
          <div className="cs-detail-row">
            <span className="cs-detail-label">Jumlah Petugas</span>
            <span className="cs-detail-value">1 orang</span>
          </div>
          <div className="cs-detail-row">
            <span className="cs-detail-label">Tanggal & Waktu Pemesanan</span>
            <span className="cs-detail-value">Rabu, 10:08</span>
          </div>
        </div>

        {/* Rincian Biaya (Estimasi) */}
        {activeStep >= 2 && (
          <div className="cs-card">
            <h2 className="cs-card-title">Rincian Biaya <span style={{fontSize: '0.8rem', fontWeight: 400, color: '#64748b'}}>(Estimasi)</span></h2>
            
            <div className="cs-detail-row">
              <span className="cs-detail-label">Tarif Bersih-bersih <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>(masih berjalan)</span></span>
              <span className="cs-detail-value">Rp {berjalanBiaya.toLocaleString('id-ID')}</span>
            </div>
            <div className="cs-detail-row">
              <span className="cs-detail-label">Biaya Layanan</span>
              <span className="cs-detail-value">Rp {biayaLayanan.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="cs-price-divider" style={{height: 1, backgroundColor: '#e2e8f0', margin: '12px 0'}}></div>
            
            <div className="cs-detail-row" style={{marginBottom: 16}}>
              <span className="cs-detail-label" style={{fontWeight: 700, color: '#1e293b'}}>Total</span>
              <span className="cs-detail-value" style={{fontWeight: 700, color: '#034078', fontSize: '1.1rem'}}>Rp {totalBiaya.toLocaleString('id-ID')}</span>
            </div>

            <div className="cs-info-box">
              <Info size={16} color="#64748b" />
              <span>Total terus diperbarui hingga pekerjaan selesai.</span>
            </div>
          </div>
        )}

            {/* Notes Card - Only show if catatan exists */}
            {orderData.catatan && (
              <div className="cs-card">
                <div className="cs-notes-header">
                  <div className="cs-notes-icon">
                    <FileText size={18} color="#eab308" fill="#fef08a" />
                  </div>
                  <h2 className="cs-card-title" style={{ margin: 0 }}>Catatan untuk Tim</h2>
                </div>
                <p className="cs-notes-text">{orderData.catatan}</p>
              </div>
            )}

            {/* Mitra Profile Card */}
            <div className="cs-card cs-mitra-card">
              <img src="https://i.pravatar.cc/150?img=11" alt="Mitra" className="cs-mitra-avatar" />
              <div className="cs-mitra-info">
                <h3 className="cs-mitra-name">Rafael gemam</h3>
                <div className="cs-mitra-rating">
                  <span className="star">★</span> 4.9 <span className="reviews">(59 ulasan)</span>
                </div>
              </div>
              <div className="cs-mitra-actions">
                <button className="cs-action-btn" onClick={() => navigate('/customer/call')}>
                  <Phone size={18} color="#034078" fill="currentColor" />
                </button>
                <button className="cs-action-btn" onClick={() => navigate('/customer/chat')}>
                  <MessageCircle size={18} color="#034078" fill="currentColor" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
