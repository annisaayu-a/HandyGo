import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Check, ShieldCheck, Clock, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ShoppingPayment.css';
import bgPaymentCash from '../../assets/bg_payment_cash.png';
import bgPaymentQris from '../../assets/bg_payment_qris.png';
import barcodeQris from '../../assets/barcode-qris.jpeg';

export default function ShoppingPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const totalBiaya = location.state?.totalBiaya || 188000;
  const method = location.state?.method || 'cash';
  const pesanan = location.state?.pesanan || {};
  const orderId = location.state?.orderId;
  
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
      if (orderId) {
        fetch(`https://handygo-api.vercel.app/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'selesai' })
        }).catch(err => console.error("Failed to update status", err));
      }
      
      // Auto redirect after 3 seconds of showing success
      const timer2 = setTimeout(() => {
        navigate('/customer/shopping/status', { state: { orderStatus: 'selesai', pesanan } });
      }, 3000);
      return () => clearTimeout(timer2);
    }
  }, [isConfirmed, navigate, pesanan, orderId]);

  return (
    <div className="cleaning-payment-page">
      {/* Header */}
      <header className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#ffffff" />
        </button>
        <h1 className="sp-title">{method === 'qris' ? 'Pembayaran QRIS' : 'Bayar di Tempat'}</h1>
      </header>

      {/* Illustration Area */}
      <div className="sp-illustration-area">
        <img src={method === 'qris' ? bgPaymentQris : bgPaymentCash} alt="Illustration" className="sp-illustration" onError={(e) => e.target.style.display='none'} />
      </div>

      {/* White Bottom Card */}
      <div className="sp-bottom-card animate-slide-up">
        <div className="sp-total-label">Total Pembayaran</div>
        <div className="sp-total-value">Rp {totalBiaya.toLocaleString('id-ID')}</div>

        {!isConfirmed ? (
          method === 'qris' ? (
            <div className="sp-qris-container">
              <div className="sp-qris-subtitle">Scan kode QR di bawah ini</div>
              <img src={barcodeQris} alt="QRIS" className="sp-qris-img" />
              
              <div className="sp-qris-timer-label">Sisa waktu pembayaran</div>
              <div className="sp-qris-timer">{formatTimeLeft()}</div>
              <div className="sp-qris-footer">QRIS akan dimuat ulang saat waktu berakhir.</div>
            </div>
          ) : (
            <>
              <div className="sp-instructions">
                <div className="sp-instruction-item">
                  <div className="sp-instruction-icon"><Wallet size={16} /></div>
                  <div className="sp-instruction-text">Bayarkan langsung kepada petugas setelah pekerjaan selesai</div>
                </div>
                <div className="sp-instruction-item">
                  <div className="sp-instruction-icon"><ShieldCheck size={16} /></div>
                  <div className="sp-instruction-text">Pastikan nominal sesuai dengan total pembayaran di atas</div>
                </div>
                <div className="sp-instruction-item">
                  <div className="sp-instruction-icon"><Check size={16} /></div>
                  <div className="sp-instruction-text">Petugas akan mengonfirmasi pembayaran setelah uang diterima</div>
                </div>
              </div>

              <div className="sp-waiting-box">
                <Clock size={20} color="#ca8a04" className="sp-waiting-icon" />
                <div>
                  <div className="sp-waiting-title">Menunggu konfirmasi petugas</div>
                  <div className="sp-waiting-desc">Setelah kamu membayar, petugas akan mengonfirmasi pembayaran di aplikasi</div>
                </div>
              </div>
            </>
          )
        ) : (
          <>
            <div className="sp-success-container animate-pop">
              <div className="sp-success-circle">
                <Check size={48} color="#ffffff" strokeWidth={3} />
              </div>
              <div className="sp-success-text">
                {method === 'qris' ? 'Pembayaran Berhasil! Kamu akan dialihkan otomatis setelah ini' : 'Pembayaran Dikonfirmasi! Kamu akan dialihkan otomatis setelah ini'}
              </div>
            </div>
          </>
        )}

        <button className="sp-help-btn">
          <MessageSquare size={18} />
          Butuh bantuan?
        </button>
      </div>
    </div>
  );
}
