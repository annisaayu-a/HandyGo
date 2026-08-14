import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import { ArrowLeft, ArrowUp, Target, ChevronRight, Check, Phone, MessageSquare } from 'lucide-react';
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
  const [driverPhase, setDriverPhase] = useState(null); // 'heading', 'arriving', 'arrived'
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const searchTimeoutRef = React.useRef(null);
  const qrisTimeoutRef = React.useRef(null);
  const trackingTimeoutRef = React.useRef(null);

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
      if (qrisTimeoutRef.current) clearTimeout(qrisTimeoutRef.current);
      if (trackingTimeoutRef.current) clearTimeout(trackingTimeoutRef.current);
    };
  }, []);

  const handleOrder = () => {
    if (paymentMethod === 'QRIS') {
      setShowQrisModal(true);
    } else if (paymentMethod === 'Tunai') {
      startSearchingDriver();
    } else {
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/customer'); 
      }, 2500);
    }
  };

  const handleQrisPaid = () => {
    setShowQrisModal(false);
    setShowPaymentSuccess(true);
    
    qrisTimeoutRef.current = setTimeout(() => {
      setShowPaymentSuccess(false);
      startSearchingDriver();
    }, 2000);
  };

  const startSearchingDriver = () => {
    setIsSearchingDriver(true);
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchingDriver(false);
      setDriverPhase('heading');
      
      trackingTimeoutRef.current = setTimeout(() => {
        setDriverPhase('arriving');
        
        trackingTimeoutRef.current = setTimeout(() => {
          setDriverPhase('arrived');
        }, 4000);
      }, 4000);
    }, 3000);
  };

  const cancelSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (trackingTimeoutRef.current) clearTimeout(trackingTimeoutRef.current);
    setIsSearchingDriver(false);
    setDriverPhase(null);
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
          {!isSearchingDriver && !driverPhase && (
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

          {/* Tracking Driver Markers & Route */}
          {driverPhase && (
            <>
              {/* Route Line */}
              <Source 
                id="route" 
                type="geojson" 
                data={{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [pickup.lng - 0.003, pickup.lat + 0.003],
                      [pickup.lng - 0.001, pickup.lat + 0.001],
                      [pickup.lng, pickup.lat]
                    ]
                  }
                }}
              >
                <Layer
                  id="route-layer"
                  type="line"
                  paint={{
                    'line-color': '#034078',
                    'line-width': 4
                  }}
                />
              </Source>

              {/* Pickup Point (Destination of driver for now) */}
              <Marker longitude={pickup.lng} latitude={pickup.lat}>
                <div className="map-marker pickup">
                  <ArrowUp size={14} color="#fff" />
                </div>
              </Marker>

              {/* Driver Marker */}
              <Marker 
                longitude={driverPhase === 'heading' ? pickup.lng - 0.003 : driverPhase === 'arriving' ? pickup.lng - 0.001 : pickup.lng} 
                latitude={driverPhase === 'heading' ? pickup.lat + 0.003 : driverPhase === 'arriving' ? pickup.lat + 0.001 : pickup.lat}
              >
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
        {!isSearchingDriver && !driverPhase && (
          <button className="transport-back-btn floating-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#1e293b" />
          </button>
        )}

        {driverPhase && (
          <button className="transport-back-btn floating-back-btn" onClick={() => setDriverPhase(null)}>
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
        ) : driverPhase ? (
          <div className="driver-tracking-container animate-fade-in">
            <p className="tracking-status-text">
              {driverPhase === 'heading' && 'Driver sedang menuju lokasi penjemputan'}
              {driverPhase === 'arriving' && 'Driver sudah dekat nih, bersiap di titik jemput ya'}
              {driverPhase === 'arrived' && 'Driver sudah sampai nih'}
            </p>
            
            {driverPhase !== 'arrived' && (
              <div className="eta-container">
                Akan sampai pada <strong>12:48 - 12:52</strong>
              </div>
            )}

            <div className="driver-profile-card">
              <img src="https://ui-avatars.com/api/?name=Rafael+Gemam&background=034078&color=fff" alt="Driver" className="driver-avatar" />
              <div className="driver-profile-info">
                <h4 className="driver-name">Rafael gemam</h4>
                <div className="driver-rating">⭐ 4.9 <span className="reviews">(59 ulasan)</span></div>
              </div>
              <div className="driver-actions">
                <button className="icon-btn phone-btn"><Phone size={18} /></button>
                <button className="icon-btn chat-btn"><MessageSquare size={18} /></button>
              </div>
            </div>
            
            <div className="driver-vehicle-plate">
              DD 1872 TU
            </div>
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

      {/* QRIS Modal */}
      {showQrisModal && (
        <div className="transport-modal-overlay animate-fade-in">
          <div className="transport-qris-modal scale-up">
            <h3 className="qris-title">Scan QRIS</h3>
            <div className="qris-image-wrapper">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                alt="QRIS Code" 
                className="qris-image"
              />
            </div>
            <p className="qris-instruction">Total: <strong>{activeVehicle.price}</strong></p>
            <p className="qris-instruction-small">Silakan scan kode QR di atas dengan aplikasi pembayaran Anda.</p>
            
            <button className="qris-confirm-btn" onClick={handleQrisPaid}>
              Saya sudah membayar
            </button>
            <button className="qris-cancel-btn" onClick={() => setShowQrisModal(false)}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="transport-modal-overlay animate-fade-in">
          <div className="transport-success-modal scale-up">
            <div className="success-icon-circle">
              <Check size={40} color="white" strokeWidth={3} />
            </div>
            <h3 className="success-modal-title">Pembayaran Berhasil!</h3>
          </div>
        </div>
      )}

      {/* Success Modal (Driver Found) */}
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
