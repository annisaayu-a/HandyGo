import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Check, ShieldCheck, Clock, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ShoppingPayment.css';
import bgPaymentQris from '../../assets/bg_payment_qris.png';
import barcodeQris from '../../assets/barcode-qris.jpeg';

export default function TransportQris() {
  const navigate = useNavigate();
  const location = useLocation();
  const totalBiaya = location.state?.totalBiaya || 18000;
  
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
    if (isConfirmed) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isConfirmed]);

  const formatTimeLeft = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m} : ${s}`;
  };

  useEffect(() => {
    if (isConfirmed) {
      // Auto redirect back to transport details to start searching driver
      const timer2 = setTimeout(() => {
        navigate('/customer/transport/details', { 
          state: { 
            ...location.state,
            startSearch: true
          },
          replace: true 
        });
      }, 3000);
      return () => clearTimeout(timer2);
    }
  }, [isConfirmed, navigate, location.state]);

  return (
    <div className="cleaning-payment-page">
      {/* Header */}
      <header className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#ffffff" />
        </button>
        <h1 className="sp-title">Pembayaran QRIS</h1>
      </header>

      {/* Illustration Area */}
      <div className="sp-illustration-area">
        <img src={bgPaymentQris} alt="Illustration" className="sp-illustration" onError={(e) => e.target.style.display='none'} />
      </div>

      {/* White Bottom Card */}
      <div className="sp-bottom-card animate-slide-up">
        <div className="sp-total-label">Total Pembayaran</div>
        <div className="sp-total-value">Rp {totalBiaya.toLocaleString('id-ID')}</div>

        {!isConfirmed ? (
          <div className="sp-qris-container">
            <div className="sp-qris-subtitle">Scan kode QR di bawah ini untuk memesan sekarang</div>
            <img src={barcodeQris} alt="QRIS" className="sp-qris-img" />
            
            <div className="sp-qris-timer-label">Sisa waktu pembayaran</div>
            <div className="sp-qris-timer">{formatTimeLeft()}</div>
            <div className="sp-qris-footer">QRIS akan dimuat ulang saat waktu berakhir.</div>
          </div>
        ) : (
          <div className="sp-success-container animate-pop">
            <div className="sp-success-circle">
              <Check size={48} color="#ffffff" strokeWidth={3} />
            </div>
            <div className="sp-success-text">
              Pembayaran Berhasil! Kamu akan dialihkan otomatis setelah ini
            </div>
          </div>
        )}

        <button className="sp-help-btn">
          <MessageSquare size={18} />
          Butuh bantuan?
        </button>
      </div>
    </div>
  );
}
