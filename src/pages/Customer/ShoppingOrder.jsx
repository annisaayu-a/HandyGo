import { ChevronLeft, ArrowUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ShoppingOrder.css';

export default function ShoppingOrder() {
  const navigate = useNavigate();

  return (
    <div className="shopping-order-page animate-fade-in">
      {/* Header */}
      <header className="shopping-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="shopping-title">Set lokasi toko</h1>
      </header>

      <main className="shopping-content">
        {/* Location Inputs Card */}
        <div className="location-card">
          <div className="location-input-group">
            <ArrowUp size={20} className="input-icon-up" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Cari lokasi toko"
            />
          </div>
          <div className="location-divider"></div>
          <div className="location-input-group">
            <Target size={20} className="input-icon-target" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Cari lokasi pengantaran"
            />
          </div>
        </div>

        {/* Map Section */}
        <h2 className="map-title">Atau pilih lewat peta</h2>
        <div 
          className="map-container" 
          onClick={() => navigate('/customer/shopping/map')}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            zIndex: 10
          }}>
            <span style={{
              backgroundColor: '#034078',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '24px',
              fontWeight: '600',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 4px 12px rgba(3,64,120,0.3)'
            }}>
              Pilih Lokasi
            </span>
          </div>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.818816827011!2d119.4975773!3d-5.1332824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee3396d1ebf81%3A0x6b81561705ec7698!2sFakultas%20Teknik%20Universitas%20Hasanuddin!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
            width="100%" 
            height="100%" 
            style={{ border: 0, pointerEvents: 'none' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </main>
    </div>
  );
}
