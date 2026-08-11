import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, FileText, Clock, Wallet, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CleaningStatus.css';

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

  const [activeStep, setActiveStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

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
    const timer1 = setTimeout(() => setActiveStep(2), 5000);
    // After 15 seconds, transition to step 3 (finished)
    const timer2 = setTimeout(() => setActiveStep(3), 15000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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

  const berjalanBiaya = Math.floor(elapsedSeconds / 60) * 1000;
  const biayaLayanan = 8000;
  const totalBiaya = berjalanBiaya + biayaLayanan;

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
            <div className={`cs-stepper-line ${activeStep >= 3 ? 'active' : ''}`} style={{ left: '50%', right: '16%' }}></div>
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
            <div className={`cs-step ${activeStep >= 3 ? 'active' : ''}`}>
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
            {/* Success Banner */}
            <div className="cs-success-banner">
              <div className="cs-success-text">
                <div className="cs-success-title">
                  <div className="cs-success-icon-check">✓</div>
                  Pekerjaan Selesai
                </div>
                <div className="cs-success-desc">Silahkan lakukan pembayaran untuk menyelesaikan pesanan</div>
              </div>
              <img src="/assets/hero.png" alt="Cleaning" className="cs-success-img" onError={(e) => e.target.style.display='none'} />
            </div>

            {/* Final Duration Card */}
            <div className="cs-live-card" style={{ marginBottom: 16 }}>
              <div className="cs-live-row">
                <Clock size={16} color="#e2e8f0" />
                <span className="cs-live-label">Durasi pengerjaan</span>
              </div>
              <div className="cs-live-time" style={{ marginTop: 8 }}>{formatTime(elapsedSeconds)}</div>
              <div className="cs-live-subtext" style={{ marginTop: 4 }}>{eta.started} - {eta.finished} WITA</div>
            </div>

            {/* Final Cost Card */}
            <div className="cs-card">
              <h2 className="cs-card-title">Rincian Biaya</h2>
              
              <div className="cs-detail-row">
                <span className="cs-detail-label">Tarif Bersih-bersih</span>
                <span className="cs-detail-value">Rp {berjalanBiaya.toLocaleString('id-ID')}</span>
              </div>
              <div className="cs-detail-row">
                <span className="cs-detail-label">Biaya Layanan</span>
                <span className="cs-detail-value">Rp {biayaLayanan.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="cs-price-divider" style={{height: 1, backgroundColor: '#e2e8f0', margin: '16px 0'}}></div>
              
              <div className="cs-detail-row" style={{marginBottom: 0}}>
                <span className="cs-detail-label" style={{fontWeight: 700, color: '#1e293b'}}>Total</span>
                <span className="cs-detail-value" style={{fontWeight: 700, color: '#034078', fontSize: '1.1rem'}}>Rp {totalBiaya.toLocaleString('id-ID')}</span>
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
              onClick={() => navigate('/customer/cleaning/payment', { state: { totalBiaya, method: paymentMethod } })}
            >
              Bayar Sekarang
            </button>
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
