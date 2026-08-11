import { ChevronLeft, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import illustration from '../../assets/delivery_illustration.png'; // Using delivery illustration as per design placeholder
import './Repair.css';

export default function Repair() {
  const navigate = useNavigate();

  return (
    <div className="repair-page animate-fade-in">
      {/* Header with Illustration */}
      <div className="repair-landing-header">
        <button className="back-btn-overlay" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#1e293b" />
        </button>
        <div className="illustration-wrapper">
          <img src={illustration} alt="Repair Illustration" className="repair-illustration" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.backgroundColor = '#fce7d2'; }} />
        </div>
        
        {/* Location Inputs Card Overlapping Illustration */}
        <div className="location-card">
          <div className="location-input-group" onClick={() => navigate('/customer/search-location', { state: { returnUrl: '/customer/repair/checkout' } })}>
            <Target size={20} className="input-icon-target" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Cari lokasi perbaikan" 
              readOnly
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div className="repair-content">
        {/* Map Section */}
        <h2 className="map-title">Atau pilih lewat peta</h2>
        <div className="map-container" onClick={() => navigate('/customer/repair/map')}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.818810243457!2d119.49392231476483!3d-5.132517853488219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee329d96c4671%3A0x3030bfbcaf770b1c!2sFakultas%20Teknik%20Universitas%20Hasanuddin!5e0!3m2!1sid!2sid!4v1689304212555!5m2!1sid!2sid" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          ></iframe>
          <div className="landing-map-overlay">
            <div className="landing-map-badge">Pilih Lokasi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
