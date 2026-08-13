import { useState, useRef } from 'react';
import { ArrowLeft, Target, Star, Clock, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchLocation.css';

export default function SearchLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  const mockHistory = [
    { name: 'BTP Blok G 114', address: 'BTP Blok G 114' },
    { name: 'Kawasan pergudangan natura', address: 'Kawasan pergudangan natura' },
    { name: 'BTP Blok G 110', address: 'BTP Blok G 110' },
    { name: 'CV Office', address: 'CV Office' }
  ];

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
    setSearchQuery(result.text || result.name || result.place_name || result.address);
    setIsFocused(false);
  };
  
  const handleLanjut = () => {
    if (location.state && location.state.returnUrl) {
      navigate(location.state.returnUrl, { state: { selectedLocation: { address: searchQuery } } });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="search-location-page animate-fade-in">
      {/* Header */}
      <header className="sl-header">
        <button className="sl-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="sl-title">Masukkan lokasi</h1>
      </header>

      {/* Search Input Box */}
      <div className={`sl-search-container ${isFocused ? 'focused' : ''}`}>
        <div className="sl-search-box-inner">
          <Target size={20} className="sl-search-icon" />
          <input 
            type="text" 
            className="sl-search-input" 
            placeholder="Cari lokasi" 
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // delay to allow click on result
              setTimeout(() => setIsFocused(false), 200);
            }}
          />
        </div>
        
        {isFocused && (
          <div className="sl-search-dropdown">
            {searchResults.length > 0 ? (
              searchResults.map((res, i) => (
                <div key={i} className="sl-dropdown-item" onClick={() => handleSelectResult(res)}>
                  <MapPin size={18} className="sl-item-icon" />
                  <div className="sl-item-text">
                    <div className="sl-item-name">{res.text}</div>
                    <div className="sl-item-address">{res.place_name}</div>
                  </div>
                </div>
              ))
            ) : (
              mockHistory.map((item, i) => (
                <div key={i} className="sl-dropdown-item" onClick={() => handleSelectResult(item)}>
                  <MapPin size={18} className="sl-item-icon" />
                  <div className="sl-item-text">
                    <div className="sl-item-name">{item.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Alamat Favorit Section - Hidden when focused */}
      {!isFocused && (
        <div className="sl-section">
        <h2 className="sl-section-title">Alamat Favorit</h2>
        <div className="sl-empty-card">
          <div className="sl-icon-circle">
            <Star size={20} fill="currentColor" />
          </div>
          <div className="sl-empty-title">Belum ada alamat favorit</div>
          <div className="sl-empty-desc">
            Yuk simpan alamat yang sering kamu kunjungi biar pesanan berikutnya lebih cepat!
          </div>
        </div>
        </div>
      )}

      {/* Alamat Terakhir Section */}
      <div className="sl-section" style={{ flex: 1, marginTop: isFocused ? '24px' : '0' }}>
        <h2 className="sl-section-title">Alamat Terakhir</h2>
        <div className="sl-empty-card">
          <div className="sl-icon-circle">
            <Clock size={20} fill="currentColor" />
          </div>
          <div className="sl-empty-title">Belum ada riwayat pesanan</div>
          <div className="sl-empty-desc">
            Lokasi pengantaran terakhirmu akan muncul di sini setelah kamu mulai pesan.
          </div>
        </div>
      </div>

      {/* Footer with Lanjut Button */}
      <footer className="sl-footer">
        <button className="sl-lanjut-btn" onClick={handleLanjut}>
          Lanjut
        </button>
      </footer>
    </div>
  );
}
