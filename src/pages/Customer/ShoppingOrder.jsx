import { useState, useRef } from 'react';
import { ChevronLeft, ArrowUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ShoppingOrder.css';

export default function ShoppingOrder() {
  const navigate = useNavigate();

  const [tokoLocation, setTokoLocation] = useState(null);
  const [pengantaranLocation, setPengantaranLocation] = useState(null);
  
  const [activeInput, setActiveInput] = useState(null); // 'toko' or 'pengantaran'
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
          // Tambahkan viewbox untuk memprioritaskan pencarian di sekitar area Makassar & Gowa
          const viewbox = '119.35,-5.05,119.55,-5.35';
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&viewbox=${viewbox}&bounded=0&limit=5`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (err) {
          console.error(err);
        }
      }, 600); // 600ms delay agar tidak diblokir oleh server
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (result) => {
    const nameParts = result.display_name.split(', ');
    const name = result.name || nameParts[0];
    const locationData = {
      name: name,
      address: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    if (activeInput === 'toko') {
      setTokoLocation(locationData);
    } else if (activeInput === 'pengantaran') {
      setPengantaranLocation(locationData);
    }

    setSearchResults([]);
    setSearchQuery('');
    setActiveInput(null);
  };

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
        <div className="location-card" style={{ position: 'relative' }}>
          <div className="location-input-group">
            <ArrowUp size={20} className="input-icon-up" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Cari lokasi toko"
              value={activeInput === 'toko' ? searchQuery : (tokoLocation ? tokoLocation.name : '')}
              onChange={handleSearch}
              onFocus={() => {
                setActiveInput('toko');
                setSearchQuery('');
                setSearchResults([]);
              }}
            />
          </div>
          <div className="location-divider"></div>
          <div className="location-input-group">
            <Target size={20} className="input-icon-target" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Cari lokasi pengantaran"
              value={activeInput === 'pengantaran' ? searchQuery : (pengantaranLocation ? pengantaranLocation.name : '')}
              onChange={handleSearch}
              onFocus={() => {
                setActiveInput('pengantaran');
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
                  <div className="result-name-inline">{res.name || res.display_name.split(',')[0]}</div>
                  <div className="result-address-inline">{res.display_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button if both selected */}
        {tokoLocation && pengantaranLocation && (
          <button 
            className="submit-btn" 
            style={{ width: '100%', marginBottom: '24px' }}
            onClick={() => {
              navigate('/customer/shopping/details', { 
                state: { 
                  toko: tokoLocation, 
                  pengantaran: pengantaranLocation 
                } 
              });
            }}
          >
            Lanjut
          </button>
        )}

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
