import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Check, ShieldCheck, Clock, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CleaningPayment.css';
import bgPaymentCash from '../../assets/bg_payment_cash.png';
import bgPaymentQris from '../../assets/bg_payment_qris.png';
import barcodeQris from '../../assets/barcode-qris.jpeg';

export default function CleaningPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const totalBiaya = location.state?.totalBiaya || 188000;
  const method = location.state?.method || 'cash';
  
  // false = waiting, true = confirmed
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(599); // 09:59

  useEffect(() => {
    // Simulate partner confirming after 5 seconds
    const timer1 = setTimeout(() => {
      setIsConfirmed(true);
    }, 5000);

    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (method !== 'qris' || isConfirmed) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [method, isConfirmed]);

  const formatTimeLeft = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m} : ${s}`;
  };

  useEffect(() => {
    if (isConfirmed) {
      // Auto redirect after 3 seconds of showing success
      const timer2 = setTimeout(() => {
        navigate('/customer/history');
      }, 3000);
      return () => clearTimeout(timer2);
    }
  }, [isConfirmed, navigate]);

  return (
    <div className="cleaning-payment-page">
      {/* Header */}
      <header className="cp-header">
        <button className="cp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#ffffff" />
        </button>
        <h1 className="cp-title">{method === 'qris' ? 'Pembayaran QRIS' : 'Bayar di Tempat'}</h1>
      </header>

      {/* Illustration Area */}
      <div className="cp-illustration-area">
        <img src={method === 'qris' ? bgPaymentQris : bgPaymentCash} alt="Illustration" className="cp-illustration" onError={(e) => e.target.style.display='none'} />
      </div>

      {/* White Bottom Card */}
      <div className="cp-bottom-card animate-slide-up">
        <div className="cp-total-label">Total Pembayaran</div>
        <div className="cp-total-value">Rp {totalBiaya.toLocaleString('id-ID')}</div>

        {!isConfirmed ? (
          method === 'qris' ? (
            <div className="cp-qris-container">
              <div className="cp-qris-subtitle">Scan kode QR di bawah ini</div>
              <img src={barcodeQris} alt="QRIS" className="cp-qris-img" />
              
              <div className="cp-qris-timer-label">Sisa waktu pembayaran</div>
              <div className="cp-qris-timer">{formatTimeLeft()}</div>
              <div className="cp-qris-footer">QRIS akan dimuat ulang saat waktu berakhir.</div>
            </div>
          ) : (
            <>
              <div className="cp-instructions">
                <div className="cp-instruction-item">
                  <div className="cp-instruction-icon"><Wallet size={16} /></div>
                  <div className="cp-instruction-text">Bayarkan langsung kepada petugas setelah pekerjaan selesai</div>
                </div>
                <div className="cp-instruction-item">
                  <div className="cp-instruction-icon"><ShieldCheck size={16} /></div>
                  <div className="cp-instruction-text">Pastikan nominal sesuai dengan total pembayaran di atas</div>
                </div>
                <div className="cp-instruction-item">
                  <div className="cp-instruction-icon"><Check size={16} /></div>
                  <div className="cp-instruction-text">Petugas akan mengonfirmasi pembayaran setelah uang diterima</div>
                </div>
              </div>

              <div className="cp-waiting-box">
                <Clock size={20} color="#ca8a04" className="cp-waiting-icon" />
                <div>
                  <div className="cp-waiting-title">Menunggu konfirmasi petugas</div>
                  <div className="cp-waiting-desc">Setelah kamu membayar, petugas akan mengonfirmasi pembayaran di aplikasi</div>
                </div>
              </div>
            </>
          )
        ) : (
          <>
            <div className="cp-success-container animate-pop">
              <div className="cp-success-circle">
                <Check size={48} color="#ffffff" strokeWidth={3} />
              </div>
              <div className="cp-success-text">
                {method === 'qris' ? 'Pembayaran Berhasil! Kamu akan dialihkan otomatis setelah ini' : 'Pembayaran Dikonfirmasi! Kamu akan dialihkan otomatis setelah ini'}
              </div>
            </div>
          </>
        )}

        <button className="cp-help-btn">
          <MessageSquare size={18} />
          Butuh bantuan?
        </button>
      </div>
    </div>
  );
}
