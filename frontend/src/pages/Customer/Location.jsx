import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Location.css';

// Default center (Makassar)
const defaultPosition = [-5.147665, 119.432731];

export default function Location() {
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const searchTimeoutRef = useRef(null);
  const reverseGeocodeTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  // Load user data on mount
  useEffect(() => {
    const userStr = localStorage.getItem('handyGoUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.default_location) {
        setAddress(user.default_location);
        setSearchQuery(user.default_location);
      }
    }
  }, []);

  const fetchAddressFromCoords = (center) => {
    if (reverseGeocodeTimeoutRef.current) {
      clearTimeout(reverseGeocodeTimeoutRef.current);
    }
    reverseGeocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=18&addressdetails=1&email=handygo-app@example.com`);
        
        if (!response.ok) {
          if (response.status === 429 || response.status === 403) {
            setAddress('Sistem peta membatasi akses sementara. Mohon tunggu.');
          } else {
            setAddress('Gagal mendapatkan lokasi dari peta');
          }
          return;
        }

        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
          setSearchQuery(data.display_name);
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setAddress(query); // update address as they type manually
    
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
    setAddress(result.place_name);
    setSearchQuery(result.place_name);
    const lat = result.center[1];
    const lon = result.center[0];
    mapRef.current?.flyTo({ center: [lon, lat], zoom: 16, duration: 1500 });
    setSearchResults([]);
  };

  const handleMoveStart = () => setIsDragging(true);

  const handleMoveEnd = (e) => {
    setIsDragging(false);
    const { lng, lat } = e.viewState;
    fetchAddressFromCoords({ lat, lng });
  };

  const handleSave = async () => {
    const userStr = localStorage.getItem('handyGoUser');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          location: address
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update localStorage
        user.default_location = address;
        localStorage.setItem('handyGoUser', JSON.stringify(user));
        
        setToastMessage('Lokasi berhasil disimpan.');
        setShowToast(true);
        
        setTimeout(() => {
          setShowToast(false);
          navigate(-1); // go back to previous screen
        }, 2000);
      } else {
        setToastMessage('Gagal menyimpan lokasi.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Gagal menghubungi server.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div className="location-settings-page animate-fade-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <div className="toast-icon-wrapper">
              <span className="toast-icon">✓</span>
            </div>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="location-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="header-title">Lokasi</h1>
      </header>

      <main className="location-content">
        <p className="location-desc">
          Atur sekali untuk digunakan di seluruh layanan.
          Kamu bisa mengubahnya kapan saja.
        </p>

        <div className="location-input-section">
          <label className="location-label">Lokasi</label>
          <div className="input-wrapper-relative">
            <textarea 
              className="location-text-input" 
              placeholder="Masukkan lokasi kamu"
              value={searchQuery}
              onChange={handleSearch}
              rows="3"
            ></textarea>
            {/* Dropdown Hasil Pencarian */}
            {searchResults.length > 0 && (
              <div className="search-results-dropdown-inline" style={{ marginTop: '5px' }}>
                {searchResults.map((res, i) => (
                  <div key={i} className="search-result-item-inline" onClick={() => handleSelectResult(res)}>
                    <div className="result-name-inline">{res.text}</div>
                    <div className="result-address-inline">{res.place_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="map-section-mini">
          <label className="location-label">Atau atur melalui peta</label>
          <div className="mini-map-container">
            <Map
              ref={mapRef}
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              initialViewState={{
                longitude: defaultPosition[1],
                latitude: defaultPosition[0],
                zoom: 16
              }}
              className="mini-map"
              mapStyle="mapbox://styles/mapbox/streets-v12"
              onMoveStart={handleMoveStart}
              onMoveEnd={handleMoveEnd}
            />
            
            {/* Custom Center Pin */}
            <div className="mini-map-center-pin">
              <div className={`mini-pin-marker ${isDragging ? 'is-dragging' : ''}`}>
                <MapPin size={32} color="#034078" fill="#034078" />
              </div>
              <div className="mini-pin-shadow"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Button */}
      <footer className="location-footer">
        <button 
          className="submit-btn" 
          onClick={handleSave}
          disabled={!address}
          style={{ width: '100%' }}
        >
          Simpan
        </button>
      </footer>
    </div>
  );
}
