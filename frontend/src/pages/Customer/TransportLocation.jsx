import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Target, Star, Clock, MapPin } from 'lucide-react';
import './DeliveryLocation.css'; // Reusing styling from DeliveryLocation

export default function TransportLocation() {
  const navigate = useNavigate();
  
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  
  const [activeInput, setActiveInput] = useState(null); // 'pickup' or 'dropoff'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const token = import.meta.env.VITE_MAPBOX_TOKEN;
          const bbox = '119.35,-5.35,119.55,-5.05';
          const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=id&bbox=${bbox}&access_token=${token}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.features) {
              setSearchResults(data.features);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 600);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (result) => {
    const locationData = {
      name: result.text,
      address: result.place_name,
      lat: result.center[1],
      lng: result.center[0]
    };

    if (activeInput === 'pickup') {
      setPickupLocation(locationData);
    } else if (activeInput === 'dropoff') {
      setDropoffLocation(locationData);
    }

    setSearchResults([]);
    setSearchQuery('');
    setActiveInput(null);
  };

  return (
    <div className="delivery-loc-container animate-fade-in" style={{ margin: '-24px -20px' }}>
      {/* Header */}
      <header className="delivery-loc-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="header-title">Mau ke mana?</h1>
      </header>

      {/* Input Card */}
      <div className="location-inputs-card" style={{ position: 'relative' }}>
        <div className="location-input-row border-bottom">
          <ArrowUp size={20} color="#1e293b" className="location-icon" />
          <input 
            type="text" 
            className="location-input" 
            placeholder="Cari lokasi penjemputan" 
            value={activeInput === 'pickup' ? searchQuery : (pickupLocation ? pickupLocation.name : '')}
            onChange={handleSearch}
            onFocus={() => {
              setActiveInput('pickup');
              setSearchQuery('');
              setSearchResults([]);
            }}
            autoFocus
          />
        </div>
        <div className="location-input-row">
          <Target size={20} color="#034078" className="location-icon" />
          <input 
            type="text" 
            className="location-input" 
            placeholder="Cari lokasi pengantaran" 
            value={activeInput === 'dropoff' ? searchQuery : (dropoffLocation ? dropoffLocation.name : '')}
            onChange={handleSearch}
            onFocus={() => {
              setActiveInput('dropoff');
              setSearchQuery('');
              setSearchResults([]);
            }}
          />
        </div>

        {/* Dropdown Hasil Pencarian */}
        {searchResults.length > 0 && activeInput && (
          <div className="search-results-dropdown-inline">
            {searchResults.map((res, i) => (
              <div key={i} className="search-result-item-inline" onClick={() => handleSelectResult(res)}>
                <MapPin size={18} color="#cbd5e1" className="result-icon" />
                <div className="result-text-container">
                  <div className="result-name-inline">{res.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="history-sections">
        {/* Favorite Addresses */}
        <section className="address-section">
          <h3 className="section-title">Alamat Favorit</h3>
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <Star size={24} color="#cbd5e1" fill="#cbd5e1" />
            </div>
            <h4 className="empty-title">Belum ada alamat favorit</h4>
            <p className="empty-subtitle">Yuk simpan alamat yang sering kamu kunjungi biar pesanan berikutnya lebih cepat!</p>
          </div>
        </section>

        {/* Last Addresses */}
        <section className="address-section">
          <h3 className="section-title">Alamat Terakhir</h3>
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <Clock size={24} color="#cbd5e1" />
            </div>
            <h4 className="empty-title">Belum ada riwayat pesanan</h4>
            <p className="empty-subtitle">Lokasi pengantaran terakhirmu akan muncul di sini setelah kamu mulai pesan.</p>
          </div>
        </section>
      </div>

      {/* Action Button if both selected */}
      {pickupLocation && dropoffLocation && (
        <div className="bottom-action-container">
          <button 
            className="submit-btn" 
            style={{ width: '100%' }}
            onClick={() => {
              // Navigate to details
              navigate('/customer/transport/details', {
                state: { pickupLocation, dropoffLocation }
              });
            }}
          >
            Lanjut
          </button>
        </div>
      )}
    </div>
  );
}
