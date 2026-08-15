import { useState, useEffect, useRef } from 'react';
import { ArrowUp, Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ShoppingMap.css';

// Default coordinate — defined OUTSIDE component to prevent re-creation every render
const DEFAULT_POSITION = [-5.185, 119.452];

export default function DeliveryMap() {
  const navigate = useNavigate();


  const [currentAddress, setCurrentAddress] = useState({
    name: 'Kabupaten Gowa',
    address: 'Sulawesi Selatan, Indonesia',
    lat: DEFAULT_POSITION[0],
    lng: DEFAULT_POSITION[1]
  });

  const [isMapDragging, setIsMapDragging] = useState(false);
  const [step, setStep] = useState('pickup'); // 'pickup' or 'dropoff'
  const [pickupLocation, setPickupLocation] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const reverseGeocodeTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  // Run ONLY on mount — empty deps [] prevents re-running on every render
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${DEFAULT_POSITION[1]},${DEFAULT_POSITION[0]}.json?access_token=${token}&language=id`)
      .then(res => res.json())
      .then(data => {
        if(data && data.features && data.features.length > 0) {
          const result = data.features[0];
          setCurrentAddress(prev => ({ ...prev, name: result.text, address: result.place_name }));
        }
      }).catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleMoveStart = (e) => {
    if (!e?.originalEvent) return;
    setIsMapDragging(true);
    setCurrentAddress(prev => ({ ...prev, name: 'Mencari lokasi...', address: '' }));
  };

  const handleMoveEnd = (e) => {
    if (!e?.originalEvent) return;
    setIsMapDragging(false);
    const { longitude: lng, latitude: lat } = e.viewState;
    
    if (reverseGeocodeTimeoutRef.current) {
      clearTimeout(reverseGeocodeTimeoutRef.current);
    }

    reverseGeocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&email=handygo-app@example.com`);
        
        if (!response.ok) {
          setCurrentAddress({ name: 'Gagal memuat', address: 'Layanan peta sedang gangguan', lat, lng });
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
          maxBounds={[[119.30, -5.30], [119.55, -5.00]]}
          initialViewState={{
            longitude: DEFAULT_POSITION[1],
            latitude: DEFAULT_POSITION[0],
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
            placeholder={step === 'pickup' ? "Ketik lokasi pengambilan di sini" : "Lokasi pengambilan (Tersimpan)"}
            value={step === 'pickup' ? searchQuery : (pickupLocation ? pickupLocation.name : '')}
            onChange={step === 'pickup' ? handleSearch : undefined}
            readOnly={step !== 'pickup'}
          />
        </div>
        <div className="location-divider"></div>
        <div className="location-input-group">
          <Target size={20} className="input-icon-target" />
          <input 
            type="text" 
            className="location-input" 
            placeholder={step === 'dropoff' ? "Ketik lokasi pengantaran di sini" : "Cari lokasi pengantaran"}
            value={step === 'dropoff' ? searchQuery : ''}
            onChange={step === 'dropoff' ? handleSearch : undefined}
            readOnly={step !== 'dropoff'}
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
          <h2 className="sheet-title">
            {step === 'pickup' ? 'Set lokasi pengambilan' : 'Set lokasi pengantaran'}
          </h2>
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
            if (step === 'pickup') {
              setPickupLocation(currentAddress);
              setStep('dropoff');
              setSearchQuery('');
            } else {
              navigate('/customer/delivery/details', { 
                state: { 
                  pickupLocation: pickupLocation, 
                  dropoffLocation: currentAddress 
                } 
              });
            }
          }}
        >
          {isMapDragging ? 'Mencari lokasi...' : 'Lanjut'}
        </button>
      </div>
    </div>
  );
}
