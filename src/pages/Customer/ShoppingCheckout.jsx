import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Banknote, ChevronDown, Check } from 'lucide-react';
import './ShoppingCheckout.css';

export default function ShoppingCheckout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state or use fallbacks
  const { toko, pengantaran, pesanan, estimasiHarga } = location.state || {
    toko: { name: 'Kost Ernias' },
    pengantaran: { name: 'Universitas Hasanuddin Kampus FAK...' },
    pesanan: 'Ayam Bakar Paha Atas (2), Ayam Bakar Dada (4)',
    estimasiHarga: '78000'
  };

  // Process prices
  const hargaBarang = parseInt(estimasiHarga.replace(/[^0-9]/g, '')) || 78000;
  const biayaPengantaran = 10000;
  const total = hargaBarang + biayaPengantaran;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(number);
  };

  const [paymentMethod, setPaymentMethod] = useState('Bayar di Tempat');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const paymentMethods = [
    { id: 'tunai', name: 'Bayar di Tempat', icon: <Banknote size={20} /> },
    { id: 'qris', name: 'QRIS', icon: <Banknote size={20} /> }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    
    // Retrieve user from local storage
    const userStr = localStorage.getItem('handyGoUser');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) { console.error('Error parsing user data', e); }
    }

    if (!user || !user.id) {
      alert("Anda harus masuk (login) terlebih dahulu.");
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          pickup_location: toko.name,
          dropoff_location: pengantaran.name,
          order_details: pesanan,
          estimated_price: total,
          payment_method: paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Gagal membuat pesanan');
      }

      setShowModal(true);
      // Auto redirect back to status page after 3 seconds
      setTimeout(() => {
        navigate('/customer/shopping/status', { state: { pesanan } });
      }, 3000);
    } catch (error) {
      alert("Terjadi kesalahan saat memproses pesanan. Pastikan server berjalan.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shopping-checkout-page animate-fade-in">
      {/* Header */}
      <header className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="details-title">Belanja</h1>
      </header>

      <main className="checkout-content">
        {/* Location Summary Card (Reused styles) */}
        <div className="summary-card">
          <p className="summary-subtitle">Pastikan titik sudah sesuai ya!</p>
          
          <div className="location-row">
            <div className="location-info">
              <h4 className="location-label">Lokasi Toko</h4>
              <p className="location-value">{toko.name}</p>
            </div>
            <button className="change-btn" onClick={() => navigate('/customer/shopping/map')}>
              Ganti lokasi
            </button>
          </div>

          <div className="location-row">
            <div className="location-info">
              <h4 className="location-label">Lokasi Pengantaran</h4>
              <p className="location-value">{pengantaran.name}</p>
            </div>
            <button className="change-btn" onClick={() => navigate('/customer/shopping/map')}>
              Ganti lokasi
            </button>
          </div>
          
          {/* Faded location detail (read only) */}
          <div className="location-note-read">
            <div className="note-icon-placeholder"></div>
            <span className="note-text-faded">Tambahin detail lokasi yuk!</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="checkout-section">
          <h3 className="section-title">Detail Pesanan</h3>
          <p className="pesanan-text">{pesanan}</p>
        </div>

        {/* Total Pesanan */}
        <div className="checkout-section">
          <h3 className="section-title">Total Pesanan</h3>
          <div className="price-row">
            <span className="price-label">Barang</span>
            <span className="price-value">{formatRupiah(hargaBarang)}</span>
          </div>
          <div className="price-row">
            <span className="price-label">Biaya Pengantaran</span>
            <span className="price-value">{formatRupiah(biayaPengantaran)}</span>
          </div>
          <div className="price-row total-row">
            <span className="price-label-bold">Total</span>
            <span className="price-value-bold">{formatRupiah(total)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="checkout-section" style={{ position: 'relative' }}>
          <h3 className="section-title">Metode Pembayaran</h3>
          <button 
            className="payment-method-btn"
            onClick={() => setShowPaymentOptions(!showPaymentOptions)}
          >
            <div className="payment-left">
              <Banknote size={20} className="payment-icon" />
              <span className="payment-text">{paymentMethod}</span>
            </div>
            <ChevronDown size={20} className={`payment-icon ${showPaymentOptions ? 'rotate-up' : ''}`} style={{ transition: 'transform 0.2s' }} />
          </button>

          {/* Simple Dropdown Menu */}
          {showPaymentOptions && (
            <div className="payment-dropdown-menu">
              {paymentMethods
                .filter(m => m.name !== paymentMethod) // Show only the other method
                .map((method) => (
                <button 
                  key={method.id} 
                  className="payment-dropdown-item"
                  onClick={() => {
                    setPaymentMethod(method.name);
                    setShowPaymentOptions(false);
                  }}
                >
                  <span className="payment-dropdown-icon">{method.icon}</span>
                  <span className="payment-dropdown-text">{method.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>



      {/* Bottom Button */}
      <div className="bottom-action-container">
        <button className="submit-btn" onClick={handleCheckout} disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Lanjut'}
        </button>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="success-modal animate-scale-up">
            <div className="success-icon-wrapper">
              <Check size={40} className="success-icon" />
            </div>
            <h2 className="success-title">Pesananmu Berhasil!</h2>
          </div>
        </div>
      )}
    </div>
  );
}
