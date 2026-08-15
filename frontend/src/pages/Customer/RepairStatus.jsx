import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageSquare, Handshake, ChevronRight, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RepairStatus.css';
import './CompletedStatus.css';

export default function RepairStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPhase = location.state?.status || 'coming';
  const [statusPhase, setStatusPhase] = useState(initialPhase);
  const [showAgreement, setShowAgreement] = useState(false);
  const [expandSparepart, setExpandSparepart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const orderId = location.state?.orderId;

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

  let orderDetails = {
    selectedLocation: { address: 'BTP Blok G 114' },
    selectedKategori: 'Saklar Rusak',
    tingkatKerusakan: 'Sedang',
    deskripsi: 'Saklarnya tidak berfungsi jadi saya buka sendiri dan terlepas seperti di foto',
    uploadedPhotos: []
  };

  if (location.state) {
    if (location.state.selectedLocation) {
      // Coming from RepairDetails
      orderDetails = { ...orderDetails, ...location.state };
    } else if (location.state.pesanan) {
      // Coming from History
      const p = location.state.pesanan;
      const parsedDetails = p.order_details ? p.order_details.split(', ') : [];
      orderDetails = {
        selectedLocation: { address: p.pickup_location || 'BTP Blok G 114' },
        selectedKategori: parsedDetails[0]?.replace('Kategori: ', '') || 'Saklar Rusak',
        tingkatKerusakan: parsedDetails[1]?.replace('Rusak: ', '') || 'Sedang',
        deskripsi: parsedDetails[2]?.replace('Desc: ', '') || 'Tidak ada deskripsi',
        uploadedPhotos: []
      };
    }
  }

  // Dynamic ETA
  const [eta, setEta] = useState({ start: '', end: '' });

  useEffect(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 15 * 60000);
    const endTime = new Date(now.getTime() + 20 * 60000);
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    };

    setEta({
      start: formatTime(startTime),
      end: formatTime(endTime)
    });
  }, []);

  // Simulate phase transitions
  useEffect(() => {
    if (statusPhase === 'coming') {
      const timer = setTimeout(() => {
        setShowAgreement(true);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (statusPhase === 'working') {
      const timer = setTimeout(() => {
        setStatusPhase('finished');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusPhase]);

  const handlePay = () => {
    if (!paymentMethod) return;
    setShowAgreement(false);
    
    const pesanan = location.state?.pesanan;
    const totalBiaya = pesanan?.estimated_price || location.state?.totalPrice || 125000;

    navigate('/customer/repair/payment', {
      state: {
        totalBiaya: totalBiaya,
        method: paymentMethod,
        orderDetails: orderDetails,
        orderId: orderId
      }
    });
  };

  return (
    <div className="rs-status-page animate-fade-in" style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <header className="rs-header">
        <button className="rs-back-btn" onClick={() => statusPhase === 'finished' ? navigate('/customer') : navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="rs-title">Pesananmu</h1>
      </header>

      {/* Content */}
      <div className="rs-content" style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Arrival Pill */}
        {statusPhase === 'coming' && (
          <div className="rs-arrival-pill" style={{ marginBottom: '32px', backgroundColor: '#ffffff', padding: '10px 24px', borderRadius: '24px', fontSize: '0.85rem', color: '#64748b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            Akan sampai pada <span style={{ fontWeight: 700, color: '#1e293b' }}>{eta.start} - {eta.end}</span>
          </div>
        )}

        {/* Stepper */}
        <div className="rs-stepper-container" style={{ width: '100%', position: 'relative', marginBottom: '32px', marginTop: statusPhase !== 'coming' ? '16px' : '0' }}>
          <div className="rs-stepper-track" style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '2px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>
          <div className="rs-stepper-line active" style={{ position: 'absolute', top: '20px', height: '2px', backgroundColor: '#034078', zIndex: 1, width: statusPhase === 'finished' ? '100%' : statusPhase === 'working' ? '50%' : '0%' }}></div>
          
          <div className="rs-steps" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            {/* Step 1 */}
            <div className="rs-step active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div className="rs-step-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#034078', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '12px', border: '2px solid #034078' }}>1</div>
              <div className="rs-step-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#034078', textAlign: 'center' }}>Menuju Lokasi</div>
            </div>
            
            {/* Step 2 */}
            <div className="rs-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div className="rs-step-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: statusPhase === 'coming' ? '#ffffff' : '#034078', border: `2px solid ${statusPhase === 'coming' ? '#e2e8f0' : '#034078'}`, color: statusPhase === 'coming' ? '#94a3b8' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '12px' }}>2</div>
              <div className="rs-step-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: statusPhase === 'coming' ? '#94a3b8' : '#034078', textAlign: 'center' }}>dikerjakan</div>
            </div>

            {/* Step 3 */}
            <div className="rs-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div className="rs-step-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: statusPhase === 'finished' ? '#034078' : '#ffffff', border: `2px solid ${statusPhase === 'finished' ? '#034078' : '#e2e8f0'}`, color: statusPhase === 'finished' ? '#ffffff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '12px' }}>3</div>
              <div className="rs-step-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: statusPhase === 'finished' ? '#034078' : '#94a3b8', textAlign: 'center' }}>Selesai</div>
            </div>
          </div>
          {statusPhase !== 'finished' && (
            <p className="rs-step-desc" style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '16px' }}>
              {statusPhase === 'coming' ? 'Petugas sedang menuju lokasi.' : 'Perbaikan sedang berlangsung'}
            </p>
          )}
        </div>

        <div className="rs-divider" style={{ width: '100vw', marginLeft: '-24px', height: '8px', backgroundColor: '#f1f5f9', marginBottom: '24px' }}></div>

        {/* Success Banner */}
        {statusPhase === 'finished' && (
          <div className="completed-banner">
            <div className="completed-banner-text">
              <div className="completed-banner-title">
                <CheckCircle2 size={20} /> Pesanan selesai!
              </div>
              <div className="completed-banner-subtitle">
                Terima kasih telah menggunakan Handygo, cari kami kapan saja!
              </div>
            </div>
            <div className="completed-banner-icon">👨‍🔧</div>
          </div>
        )}

        {/* Order Details Card */}
        {statusPhase !== 'finished' && (
          <div className="rs-card" style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
            <h2 className="rs-card-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Detail Pesanan</h2>
            
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Lokasi</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>{orderDetails.selectedLocation.address}</span>
            </div>
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Jenis Perbaikan</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>Kelistrikan</span>
            </div>
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Kategori</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>{orderDetails.selectedKategori || 'Saklar Rusak'}</span>
            </div>
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Tingkat Kerusakan</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>{orderDetails.tingkatKerusakan || 'Sedang'}</span>
            </div>
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Jumlah Petugas</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>1 orang</span>
            </div>
          </div>
        )}

        {/* Description Card */}
        {statusPhase !== 'finished' && (
          <div className="rs-card" style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertCircle size={18} color="#eab308" />
              <h2 className="rs-card-title" style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700 }}>Deskripsi</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {orderDetails.deskripsi || 'Tidak ada deskripsi yang ditambahkan.'}
            </p>
            {orderDetails.uploadedPhotos && orderDetails.uploadedPhotos.length > 0 && (
              <div className="rs-desc-images">
                {orderDetails.uploadedPhotos.map((photo, index) => (
                  <img key={index} src={photo.thumbnail} alt="Uploaded" className="rs-desc-img" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rincian Biaya (Shown in Working & Finished phases) */}
        {statusPhase !== 'coming' && (
          <div className="rs-card" style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid #f1f5f9' }}>
            <h2 className="rs-card-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Rincian Biaya</h2>
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Biaya Kunjungan</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>Rp 20.000</span>
            </div>
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Biaya Jasa</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>Rp 80.000</span>
            </div>
            
            <div className="rs-expandable-row" onClick={() => setExpandSparepart(!expandSparepart)} style={{ padding: '4px 0' }}>
              <span className="rs-expandable-label" style={{ fontSize: '0.85rem' }}>
                Sparepart / Material {expandSparepart ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
              </span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>Rp 25.000</span>
            </div>
            
            {expandSparepart && (
              <div className="rs-sub-items" style={{ paddingLeft: '8px', marginBottom: '8px' }}>
                <div className="rs-sub-item-row" style={{ padding: '2px 0', fontSize: '0.8rem' }}>
                  <span><span className="rs-sub-item-bullet"></span> Saklar seri</span>
                  <span>Rp 15.000</span>
                </div>
                <div className="rs-sub-item-row" style={{ padding: '2px 0', fontSize: '0.8rem' }}>
                  <span><span className="rs-sub-item-bullet"></span> Sekrup & Bracket</span>
                  <span>Rp 10.000</span>
                </div>
              </div>
            )}
            
            <div className="rs-divider" style={{ width: '100%', marginLeft: 0, height: '1px', backgroundColor: '#e2e8f0', margin: '16px 0' }}></div>
            
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              <span>Total</span>
              <span style={{ color: '#034078', fontSize: '1.15rem' }}>Rp 125.000</span>
            </div>
          </div>
        )}

        {/* Technician Card (Inline for Finished) */}
        {statusPhase === 'finished' && (
          <>
            <div className="courier-card" style={{ marginBottom: '24px' }}>
              <div className="courier-info-left">
                <img src="https://i.pravatar.cc/150?u=rafael" alt="Mitra" className="courier-avatar" />
                <div className="courier-text">
                  <h4 className="courier-name">Rafael gemam</h4>
                  <div className="courier-rating">
                    <span className="star">★</span> 4.9 <span className="reviews">(59 ulasan)</span>
                  </div>
                </div>
              </div>
              <div className="courier-actions">
                <button className="courier-action-btn" onClick={() => navigate('/customer/call')} style={{ cursor: 'pointer' }}>
                  <Phone size={18} color="#034078" />
                </button>
                <button className="courier-action-btn" onClick={() => navigate('/customer/chat')} style={{ cursor: 'pointer' }}>
                  <MessageSquare size={18} color="#034078" />
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

      {/* Technician Floating Bottom Card (Only for non-finished phases) */}
      {statusPhase !== 'finished' && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 48px)', maxWidth: 'calc(480px - 48px)', backgroundColor: '#ffffff', borderRadius: '30px', padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', zIndex: 20, boxSizing: 'border-box', border: '1px solid #f1f5f9' }}>
          <img src="https://i.pravatar.cc/150?u=rafael" alt="Mitra" style={{ width: '48px', height: '48px', borderRadius: '50%', marginRight: '16px', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700 }}>Rafael gemam</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#eab308' }}>★</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>4.9</span>
              <span>(59 ulasan)</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/customer/call')} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Phone size={20} color="#034078" />
            </button>
            <button onClick={() => navigate('/customer/chat')} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MessageSquare size={20} color="#034078" />
            </button>
          </div>
        </div>
      )}

      {/* Cost Agreement Bottom Sheet Overlay */}
      {showAgreement && (
        <div className="rs-overlay" style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeIn 0.3s ease-out' }}>
          <div className="rs-agreement-sheet">
            <div className="rs-agreement-icon-wrapper">
              <div className="rs-agreement-icon-circle">
                <Handshake size={32} />
              </div>
            </div>
            
            <h3 className="rs-agreement-title">Kesepakatan Biaya</h3>
            <p className="rs-agreement-subtitle">Pemeriksaan oleh teknisi telah selesai</p>

            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Biaya Kunjungan</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>Rp 20.000</span>
            </div>
            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span className="rs-detail-label" style={{ color: '#64748b' }}>Biaya Jasa</span>
              <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>Rp 80.000</span>
            </div>
            
            {/* Expandable Sparepart */}
            <div>
              <div className="rs-expandable-row" onClick={() => setExpandSparepart(!expandSparepart)}>
                <span className="rs-expandable-label">
                  Sparepart / Material {expandSparepart ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                </span>
                <span className="rs-detail-value" style={{ fontWeight: 600, color: '#1e293b' }}>Rp 25.000</span>
              </div>
              
              {expandSparepart && (
                <div className="rs-sub-items">
                  <div className="rs-sub-item-row">
                    <span><span className="rs-sub-item-bullet"></span> Saklar seri</span>
                    <span>Rp 15.000</span>
                  </div>
                  <div className="rs-sub-item-row">
                    <span><span className="rs-sub-item-bullet"></span> Sekrup & Bracket</span>
                    <span>Rp 10.000</span>
                  </div>
                </div>
              )}
            </div>

            <div className="rs-detail-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
              <span>Total</span>
              <span style={{ color: '#034078', fontSize: '1.25rem' }}>Rp 125.000</span>
            </div>

            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, margin: '16px 0 12px 0' }}>Pilih Metode Pembayaran</h4>
            
            <div 
              className={`rs-payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`} 
              onClick={() => setPaymentMethod('cash')}
              style={{ display: 'flex', alignItems: 'center', padding: '16px', border: `1px solid ${paymentMethod === 'cash' ? '#034078' : '#e2e8f0'}`, borderRadius: '16px', marginBottom: '12px', backgroundColor: paymentMethod === 'cash' ? '#f8fafc' : '#ffffff', cursor: 'pointer' }}
            >
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e40af', color: 'white', borderRadius: '8px', marginRight: '12px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Rp</span>
              </div>
              <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>Bayar di tempat</span>
              <div className={`rs-radio-btn ${paymentMethod === 'cash' ? 'selected' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'cash' ? '#22c55e' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === 'cash' && <div className="rs-radio-inner" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>}
              </div>
            </div>

            <div 
              className={`rs-payment-option ${paymentMethod === 'qris' ? 'selected' : ''}`} 
              onClick={() => setPaymentMethod('qris')}
              style={{ display: 'flex', alignItems: 'center', padding: '16px', border: `1px solid ${paymentMethod === 'qris' ? '#034078' : '#e2e8f0'}`, borderRadius: '16px', marginBottom: '24px', backgroundColor: paymentMethod === 'qris' ? '#f8fafc' : '#ffffff', cursor: 'pointer' }}
            >
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0284c7', color: 'white', borderRadius: '8px', marginRight: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                QRIS
              </div>
              <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>QRIS</span>
              <div className={`rs-radio-btn ${paymentMethod === 'qris' ? 'selected' : ''}`} style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'qris' ? '#22c55e' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === 'qris' && <div className="rs-radio-inner" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>}
              </div>
            </div>

            <button 
              onClick={handlePay} 
              disabled={!paymentMethod}
              style={{ width: '100%', padding: '16px', backgroundColor: paymentMethod ? '#034078' : '#e2e8f0', color: paymentMethod ? '#ffffff' : '#94a3b8', border: 'none', borderRadius: '24px', fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, cursor: paymentMethod ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}
            >
              Pilih Metode Pembayaran
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
