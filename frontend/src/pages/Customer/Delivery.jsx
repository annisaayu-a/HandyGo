import { ChevronLeft, ArrowUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import illustration from '../../assets/delivery_illustration.png';
import './Delivery.css';

export default function Delivery() {
  const navigate = useNavigate();

  return (
    <div className="delivery-landing-page animate-fade-in">
      {/* Header with Illustration */}
      <div className="delivery-landing-header">
        <button className="back-btn-overlay" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <img src={illustration} alt="Delivery Illustration" className="delivery-illustration" />
        
        {/* Search Card overlapping illustration */}
        <div className="landing-search-card">
          <div className="landing-input-group" onClick={() => navigate('/customer/search-location')}>
            <ArrowUp size={20} className="input-icon-up" />
            <div className="landing-input-placeholder">Cari lokasi pengambilan paket</div>
          </div>
          <div className="landing-divider"></div>
          <div className="landing-input-group" onClick={() => navigate('/customer/search-location')}>
            <Target size={20} className="input-icon-target" />
            <div className="landing-input-placeholder">Cari lokasi pengantaran paket</div>
          </div>
        </div>
      </div>

      <main className="delivery-landing-content">
        {/* Map Section */}
        <h2 className="landing-map-title">Atau pilih lewat peta</h2>
        <div 
          className="landing-map-container" 
          onClick={() => navigate('/customer/delivery/map')} 
        >
          <div className="landing-map-overlay">
            <span className="landing-map-badge">
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
