import { useState, useEffect, useRef } from 'react';
import { Target, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ShoppingMap.css'; // Reusing the map styles

export default function RepairMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || '/customer/repair/checkout';

  // Default coordinate
  const defaultPosition = [-5.1325178, 119.4939223]; 

  const [currentAddress, setCurrentAddress] = useState({
    name: 'Mencari lokasi...',
    address: 'Sedang memuat alamat...',
    lat: defaultPosition[0],
    lng: defaultPosition[1]
  });

  const [isMapDragging, setIsMapDragging] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const reverseGeocodeTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${defaultPosition[0]}&lon=${defaultPosition[1]}&zoom=18&addressdetails=1&email=handygo-app@example.com`)
      .then(res => res.json())
      .then(data => {
        if(data && data.display_name) {
          const nameParts = data.display_name.split(', ');
          const name = data.name || (data.address && data.address.road) || nameParts[0];
          setCurrentAddress(prev => ({ ...prev, name: name, address: data.display_name }));
        }
      }).catch(console.error);
  }, [defaultPosition]);

  // Fungsi Pencarian (Autocomplete)
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

  // Saat hasil pencarian dipilih
  const handleSelectResult = (result) => {
    const lat = result.center[1];
    const lon = result.center[0];
    
    // Terbang ke titik baru
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
    const { lng, lat } = e.viewState;
    
    if (reverseGeocodeTimeoutRef.current) {
      clearTimeout(reverseGeocodeTimeoutRef.current);
    }

    reverseGeocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=handygo-app@example.com`);
        
        if (!response.ok) {
          if (response.status === 429 || response.status === 403) {
            setCurrentAddress({ name: 'Terlalu banyak klik', address: 'Sistem peta membatasi akses sementara. Mohon tunggu 1-2 menit.', lat, lng });
          } else {
            setCurrentAddress({ name: 'Gagal memuat', address: 'Layanan peta sedang gangguan', lat, lng });
          }
          return;
        }

        const data = await response.json();
        
        if (data && data.display_name) {
          const nameParts = data.display_name.split(', ');
          const name = data.name || (data.address && data.address.road) || nameParts[0];
          setCurrentAddress({
            name: name,
            address: data.display_name,
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

  return (
    <div className="shopping-map-page animate-fade-in">
      {/* Full screen Map */}
      <div className="fullscreen-map" style={{ zIndex: 0 }}>
        <Map
          ref={mapRef}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
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
        {/* Back Button */}
        <button 
          className="map-back-btn" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        {/* Floating Top Search Card */}
        <div className="floating-top-card">
        <div className="location-input-group">
          <Target size={20} className="input-icon-target" />
          <input 
            type="text" 
            className="location-input" 
            placeholder="Cari lokasi"
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
        <div className="bottom-sheet-header">
          <h2 className="sheet-title">Set lokasi</h2>
          <button className="edit-btn">Edit</button>
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
          onClick={() => {
            navigate(returnUrl, { state: { selectedLocation: currentAddress } });
          }}
        >
          {isMapDragging ? 'Mencari lokasi...' : 'Lanjut'}
        </button>
      </div>
    </div>
  );
}
