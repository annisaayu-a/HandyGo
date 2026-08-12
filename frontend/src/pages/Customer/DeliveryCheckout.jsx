import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';
import mapRoutePlaceholder from '../../assets/map_route_placeholder.png';
import './DeliveryCheckout.css';

export default function DeliveryCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Data passed from previous steps
  const { 
    pickup = { name: 'Universitas Hasanuddin Fak...' },
    dropoff = { name: 'Pondok Nabil' },
    senderName = 'Ajel',
    receiverName = 'Hana',
    selectedSize = 'kecil',
    weight = '4',
    selectedVehicle = { name: 'Motor', desc: 'Paket kecil & sedang (maks. 20kg)', price: 'Rp 23.000', icon: '🛵' },
    selectedCategory = 'pakaian'
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const formatSize = (size) => {
    if (!size) return '';
    return size.charAt(0).toUpperCase() + size.slice(1);
  };

  const formatCategory = (cat) => {
    if (!cat) return 'Barang';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const handleCheckout = async () => {
    const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
    let createdOrderId = null;
    if (storedUser.id) {
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: storedUser.id,
            service_name: 'Antar Barang',
            pickup_location: pickup.name,
            dropoff_location: dropoff.name,
            order_details: `Penerima: ${receiverName}, Barang: ${formatCategory(selectedCategory)} (${formatSize(selectedSize)} ${weight}kg)`,
            estimated_price: 30000,
            payment_method: paymentMethod
          })
        });
        const data = await response.json();
        createdOrderId = data.order?.id;
      } catch (err) {
        console.error("Failed to create order:", err);
      }
    }
    
    setShowSuccessPopup(true);
    
    // Auto redirect to status page after 2 seconds
    setTimeout(() => {
      navigate('/customer/delivery/status', { state: { ...location.state, orderId: createdOrderId } });
    }, 2000);
  };

  return (
    <div className="delivery-checkout-container animate-fade-in">
      {/* Background Header */}
      <div className="checkout-blue-bg"></div>

      <header className="checkout-header">
        <button className="icon-btn-white" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#ffffff" />
        </button>
        <h1 className="header-title-white">Antar Barang</h1>
      </header>

      <div className="checkout-content">
        {/* Delivery Details Block */}
        <section className="checkout-details-section">
          <h2 className="section-title-white">Detail Pengiriman</h2>
          
          <div className="location-item">
            <p className="location-label">Diambil di</p>
            <p className="location-person">{senderName}</p>
            <p className="location-address-light">{pickup.name}</p>
          </div>

          <div className="location-item mt-16">
            <p className="location-label">Diantar ke</p>
            <p className="location-person">{receiverName}</p>
            <p className="location-address-light">{dropoff.name}</p>
          </div>

          <div className="category-tag">
            <span className="tag-icon">👕</span>
            <span className="tag-text">{formatCategory(selectedCategory)}</span>
            <ChevronRight size={14} color="#64748b" />
          </div>
        </section>

        {/* White Card Overlay */}
        <div className="checkout-white-card">
          <div className="size-weight-row">
            <span className="info-label">Ukuran & Berat</span>
            <div className="info-value-group">
              <span className="info-value">{formatSize(selectedSize)} ({weight} kg)</span>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>
          
          <div className="card-divider"></div>
          
          <div className="map-preview-section">
            <p className="time-estimate">Diperkirakan sampai pada 18:10 - 18:44</p>
            <div className="map-image-wrapper">
              <img src={mapRoutePlaceholder} alt="Route Map" className="map-image" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="checkout-bottom-action">
        <div className="payment-row" onClick={() => setIsPaymentSheetOpen(true)}>
          <span className="payment-label">Metode Pembayaran</span>
          <div className="payment-value-group">
            <span className="payment-value">{paymentMethod}</span>
            <ChevronRight size={16} color="#94a3b8" />
          </div>
        </div>

        <div className="checkout-vehicle-row">
          <div className="vehicle-icon-wrapper">{selectedVehicle.icon || '🛵'}</div>
          <div className="vehicle-details">
            <h4 className="vehicle-name">{selectedVehicle.name}</h4>
            <p className="vehicle-desc">{selectedVehicle.desc}</p>
          </div>
          <div className="vehicle-price">{selectedVehicle.price}</div>
        </div>

        <button className="save-btn" onClick={handleCheckout}>
          Pesan Sekarang
        </button>
      </div>

      {/* Payment Sheet */}
      {isPaymentSheetOpen && (
        <div className="modal-overlay">
          <div className="payment-sheet animate-slide-up">
            <div className="sheet-handle" onClick={() => setIsPaymentSheetOpen(false)}></div>
            <h3 className="sheet-title">Metode Pembayaran</h3>
            <div className="payment-options">
              <div 
                className={`payment-option ${paymentMethod === 'Tunai' ? 'selected' : ''}`}
                onClick={() => { setPaymentMethod('Tunai'); setIsPaymentSheetOpen(false); }}
              >
                <span>Tunai</span>
                {paymentMethod === 'Tunai' && <Check size={20} color="#034078" />}
              </div>
              <div 
                className={`payment-option ${paymentMethod === 'QRIS' ? 'selected' : ''}`}
                onClick={() => { setPaymentMethod('QRIS'); setIsPaymentSheetOpen(false); }}
              >
                <span>QRIS</span>
                {paymentMethod === 'QRIS' && <Check size={20} color="#034078" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="modal-overlay-center">
          <div className="success-popup animate-pop-in">
            <div className="success-icon-wrapper">
              <Check size={40} color="white" />
            </div>
            <h3 className="success-title">Pesananmu Berhasil!</h3>
          </div>
        </div>
      )}
    </div>
  );
}
