import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Location.css';

// Default center (Makassar)
const defaultPosition = [-5.147665, 119.432731];

export default function Location() {
  const navigate = useNavigate();
  
  const [currentAddress, setCurrentAddress] = useState({
    name: 'Mencari lokasi...',
    address: '',
    lat: defaultPosition[0],
    lng: defaultPosition[1]
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isMapDragging, setIsMapDragging] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const searchTimeoutRef = useRef(null);
  const reverseGeocodeTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('handyGoUser');
    let hasSavedLocation = false;
    
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.default_location) {
        hasSavedLocation = true;
        setCurrentAddress(prev => ({ ...prev, address: user.default_location, name: user.default_location }));
      }
    }

    if (!hasSavedLocation) {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${defaultPosition[1]},${defaultPosition[0]}.json?access_token=${token}&language=id`)
        .then(res => res.json())
        .then(data => {
          if(data && data.features && data.features.length > 0) {
            const result = data.features[0];
            setCurrentAddress(prev => ({ ...prev, name: result.text, address: result.place_name }));
          }
        }).catch(console.error);
    }
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&viewbox=119.30,-5.00,119.55,-5.30&bounded=1&email=handygo-app@example.com`);
          if (response.ok) {
            const data = await response.json();
            const formatted = data.map(item => {
               const nameParts = item.display_name.split(', ');
               const name = item.name || (item.address && item.address.road) || nameParts[0];
               return {
                 text: name,
                 place_name: item.display_name,
                 center: [parseFloat(item.lon), parseFloat(item.lat)]
               }
            });
            setSearchResults(formatted);
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
    const lat = result.center[1];
    const lon = result.center[0];
    
    mapRef.current?.flyTo({ center: [lon, lat], zoom: 17, duration: 1500 });
    setSearchResults([]);
    setSearchQuery('');
    
    setCurrentAddress({
      name: result.text,
      address: result.place_name,
      lat: lat,
      lng: lon
    });
  };

  const handleMoveStart = () => {
    setIsMapDragging(true);
    setCurrentAddress(prev => ({ ...prev, name: 'Mencari lokasi...', address: '' }));
  };

  const handleMoveEnd = (e) => {
    setIsMapDragging(false);
    const { longitude: lng, latitude: lat } = e.viewState;
    
    if (reverseGeocodeTimeoutRef.current) {
      clearTimeout(reverseGeocodeTimeoutRef.current);
    }

    reverseGeocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=id`);
        
        if (!response.ok) {
          setCurrentAddress({ name: 'Gagal memuat', address: 'Layanan peta sedang gangguan', lat, lng });
          return;
        }

        const data = await response.json();
        
        if (data && data.features && data.features.length > 0) {
          const result = data.features[0];
          setCurrentAddress({
            name: result.text,
            address: result.place_name,
            lat,
            lng
          });
        } else {
          setCurrentAddress({ name: 'Lokasi tidak dikenal', address: 'Tidak dapat menemukan alamat di titik ini', lat, lng });
        }
      } catch (err) {
        console.error("Gagal mendapatkan lokasi:", err);
        setCurrentAddress({ name: 'Gagal memuat', address: 'Periksa koneksi internet Anda', lat, lng });
      }
    }, 500);
  };

  const handleSave = async () => {
    const userStr = localStorage.getItem('handyGoUser');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    
    try {
      const response = await fetch('https://handygo-api.vercel.app/api/auth/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          location: currentAddress.name
        })
      });

      if (response.ok) {
        // Update localStorage
        user.default_location = currentAddress.name;
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
    <div className="location-map-page animate-fade-in">
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

      {/* Full screen Map */}
      <div className="fullscreen-map" style={{ zIndex: 0 }}>
        <Map
          ref={mapRef}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          maxBounds={[[119.30, -5.30], [119.55, -5.00]]}
          initialViewState={{
            longitude: defaultPosition[1],
            latitude: defaultPosition[0],
            zoom: 16
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onMoveStart={handleMoveStart}
          onMoveEnd={handleMoveEnd}
        />
        
        {/* Custom Map Pin (Static in Center) */}
        <div className="map-pin-center" style={{ pointerEvents: 'none', zIndex: 400, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
               style={{ 
                 transform: isMapDragging ? 'translateY(-10px)' : 'translateY(0)', 
                 transition: 'transform 0.2s',
                 filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.25))'
               }}>
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#034078"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="map-floating-header">
        
        {/* Floating Top Search Card */}
        <div className="floating-top-card">
          <div className="location-input-group">
            <ArrowUp size={20} className="input-icon-up" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Ketik lokasi kamu di sini"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Dropdown Hasil Pencarian */}
          {searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((res, i) => (
                <div key={i} className="search-result-item" onClick={() => handleSelectResult(res)}>
                  <div className="search-result-info">
                    <p className="search-result-name">{res.text}</p>
                    <p className="search-result-address">{res.place_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bottom-sheet" style={{ zIndex: 1000 }}>
        {/* Floating Back Button */}
        <button 
          className="map-back-btn floating-back-btn" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <div className="bottom-sheet-header">
          <h2 className="sheet-title">Atur Lokasi Utama</h2>
        </div>
        
        <div className="selected-location-box">
          <h3 className="location-name">{currentAddress.name}</h3>
          <p className="location-address">
            {currentAddress.address}
          </p>
        </div>

        <button 
          className="submit-btn" 
          style={{ marginTop: '16px' }}
          disabled={isMapDragging || !currentAddress.address}
          onClick={handleSave}
        >
          Simpan Lokasi
        </button>
      </div>
    </div>
  );
}
