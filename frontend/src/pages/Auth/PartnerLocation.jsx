import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Info } from 'lucide-react';
import './PartnerLocation.css';

export default function PartnerLocation() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Makassar'); // Default checked in screenshot

  const cities = [
    'Jabodetabek',
    'Bandung',
    'Surabaya',
    'Makassar',
    'Palembang',
    'Manado'
  ];

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(search.toLowerCase())
  );

  const handleNext = () => {
    if (selectedCity) {
      navigate('/partner-vehicle');
    }
  };

  return (
    <div className="partner-location-container animate-fade-in">
      <div className="pl-header">
        <button className="pl-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="pl-title">Pilih Kota Operasional</h1>
      </div>

      <div className="pl-content">
        <div className="pl-search-container">
          <Search size={20} color="#94a3b8" className="pl-search-icon" />
          <input 
            type="text" 
            placeholder="Cari Kota/Daerah" 
            className="pl-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="pl-city-list">
          {filteredCities.map((city) => (
            <div 
              key={city} 
              className="pl-city-item"
              onClick={() => setSelectedCity(city)}
            >
              <span className="pl-city-name">{city}</span>
              <div className={`pl-radio ${selectedCity === city ? 'selected' : ''}`}>
                {selectedCity === city && (
                  <svg viewBox="0 0 24 24" fill="none" className="pl-check-icon">
                    <circle cx="12" cy="12" r="12" fill="#16a34a" />
                    <path d="M7 12.5L10.5 16L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pl-info-section">
          <Info size={16} color="#94a3b8" className="pl-info-icon" />
          <span className="pl-info-text">Kamu dapat mengubah kota operasional ini kapan saja</span>
        </div>
      </div>

      <div className="pl-bottom-action">
        <button 
          className={`pl-submit-btn ${!selectedCity ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!selectedCity}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
