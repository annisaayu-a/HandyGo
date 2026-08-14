import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Target, ChevronRight, Check } from 'lucide-react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './TransportDetails.css';

export default function TransportDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const pickup = location.state?.pickupLocation || { name: 'Universitas Hasanuddin Fakultas Tekni...', lat: -5.1332, lng: 119.4975 };
  const dropoff = location.state?.dropoffLocation || { name: 'Pondok Nabil', lat: -5.1382, lng: 119.5015 };
  
  const paymentMethod = location.state?.paymentMethod || 'Tunai';

  const [selectedVehicle, setSelectedVehicle] = useState('motor'); 
  const [isVehicleSheetOpen, setIsVehicleSheetOpen] = useState(false);
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const searchTimeoutRef = React.useRef(null);

  const vehicles = [
    { id: 'motor', name: 'Motor', desc: 'sampai dalam 2-4 menit', capacity: '1', price: 'Rp 18.000', priceValue: 18000, img: '🛵' },
    { id: 'mobil', name: 'Mobil', desc: 'sampai dalam 5 menit', capacity: '4', price: 'Rp 35.000', priceValue: 35000, img: '🚗' },
    { id: 'mobil_xl', name: 'Mobil XL', desc: 'sampai dalam 5-10 menit', capacity: '6', price: 'Rp 79.000', priceValue: 79000, img: '🚙' }
  ];

  const activeVehicle = vehicles.find(v => v.id === selectedVehicle);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleOrder = () => {
    if (paymentMethod === 'Tunai') {
      setIsSearchingDriver(true);
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearchingDriver(false);
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/customer'); 
        }, 2500);
      }, 4000);
    } else {
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/customer'); 
      }, 2500);
    }
  };

  const cancelSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setIsSearchingDriver(false);
  };

  return (
    <div className="transport-details-page animate-fade-in">
      {/* Map Background */}
      <div className="fullscreen-map">
        <Map
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          initialViewState={{
            longitude: (pickup.lng + dropoff.lng) / 2,
            latitude: (pickup.lat + dropoff.lat) / 2,
            zoom: 14
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {/* Default Markers */}
          {!isSearchingDriver && (
            <>
              <Marker longitude={pickup.lng} latitude={pickup.lat}>
                <div className="map-marker pickup">
                  <ArrowUp size={14} color="#fff" />
                </div>
              </Marker>
              <Marker longitude={dropoff.lng} latitude={dropoff.lat}>
                <div className="map-marker dropoff">
                  <Target size={14} color="#fff" />
                </div>
              </Marker>
            </>
          )}

          {/* Searching Driver Markers */}
          {isSearchingDriver && (
            <>
              <Marker longitude={pickup.lng} latitude={pickup.lat}>
                <div className="pulsing-circle-wrapper">
                  <div className="pulsing-circle"></div>
                  <div className="pulsing-core"></div>
                </div>
              </Marker>
              
              <Marker longitude={pickup.lng + 0.003} latitude={pickup.lat + 0.002}>
                <div className="dummy-driver-marker">🛵</div>
              </Marker>
              
              <Marker longitude={pickup.lng - 0.002} latitude={pickup.lat + 0.004}>
                <div className="dummy-driver-marker">🛵</div>
              </Marker>
            </>
          )}
        </Map>
      </div>

      {/* Top UI */}
      <div className="transport-top-ui">
        {/* Floating Top Card */}
        <div className="floating-location-card">
          <div className="location-row">
            <ArrowUp size={18} className="loc-icon-up" />
            <span className="loc-text">{pickup.name}</span>
          </div>
          <div className="loc-divider"></div>
          <div className="location-row">
            <Target size={18} className="loc-icon-target" />
            <span className="loc-text">{dropoff.name}</span>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="transport-bottom-sheet">
        {!isSearchingDriver && (
          <button className="transport-back-btn floating-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#1e293b" />
          </button>
        )}
        
        {isSearchingDriver ? (
          <div className="searching-driver-container animate-fade-in">
            <p className="searching-driver-text">Sedang mencari driver terdekat</p>
            <button className="cancel-search-btn" onClick={cancelSearch}>
              Batalkan Pesanan
            </button>
          </div>
        ) : (
          <>
            {/* Vehicle Selection Area */}
            {isVehicleSheetOpen ? (
              <div className="vehicle-options-container">
                <div className="drag-handle" onClick={() => setIsVehicleSheetOpen(false)}></div>
                {vehicles.map(vehicle => (
                  <div 
                    key={vehicle.id} 
                    className={`vehicle-card ${selectedVehicle === vehicle.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedVehicle(vehicle.id);
                      setIsVehicleSheetOpen(false);
                    }}
                  >
                    <div className="vehicle-icon">{vehicle.img}</div>
                    <div className="vehicle-info">
                      <h4 className="v-name">{vehicle.name}</h4>
                      <p className="v-desc">{vehicle.desc} <span className="v-capacity">👤 {vehicle.capacity}</span></p>
                    </div>
                    <div className="vehicle-price">{vehicle.price}</div>
                  </div>
                ))}
                <p className="vehicle-note">*Belum termasuk ongkos tol/parkir</p>
              </div>
            ) : (
              <div className="selected-vehicle-card" onClick={() => setIsVehicleSheetOpen(true)}>
                <div className="drag-handle"></div>
                <div className="vehicle-card border-none">
                  <div className="vehicle-icon">{activeVehicle.img}</div>
                  <div className="vehicle-info">
                    <h4 className="v-name">{activeVehicle.name}</h4>
                    <p className="v-desc">{activeVehicle.desc} <span className="v-capacity">👤 {activeVehicle.capacity}</span></p>
                  </div>
                  <div className="vehicle-price">{activeVehicle.price}</div>
                </div>
              </div>
            )}

            <div className="payment-summary-section">
              <div 
                className="payment-method-row" 
                onClick={() => navigate('/customer/transport/payment', { 
                  state: { pickupLocation: pickup, dropoffLocation: dropoff, selectedVehicle, paymentMethod } 
                })}
              >
                <span className="payment-label">Metode Pembayaran</span>
                <div className="payment-value">
                  {paymentMethod} <ChevronRight size={16} color="#64748b" />
                </div>
              </div>
              
              <div className="total-row">
                <span className="total-label">Total</span>
                <span className="total-value">{activeVehicle.price}</span>
              </div>

              <button className="order-btn" onClick={handleOrder}>
                Pesan Sekarang
              </button>
            </div>
          </>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="transport-modal-overlay animate-fade-in">
          <div className="transport-success-modal scale-up">
            <div className="success-icon-circle">
              <Check size={40} color="white" strokeWidth={3} />
            </div>
            <h3 className="success-modal-title">Pesananmu Berhasil!</h3>
          </div>
        </div>
      )}
    </div>
  );
}
