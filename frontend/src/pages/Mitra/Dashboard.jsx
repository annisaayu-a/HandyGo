import { useState, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User, Power, ChevronRight, AlertCircle, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import './Dashboard.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MitraDashboard() {
  const [viewState, setViewState] = useState({
    longitude: 119.4920,
    latitude: -5.1325,
    zoom: 14.5
  });
  
  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState('pending');
  const [isOnline, setIsOnline] = useState(false);
  
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [isOrderAccepted, setIsOrderAccepted] = useState(false);

  const handleAlertClick = () => {
    if (status === 'pending') {
      setStatus('active');
    }
  };

  const toggleOnline = () => {
    if (status !== 'pending') {
      setIsOnline(!isOnline);
      if (isOnline) {
        // Going offline
        setIncomingOrder(null);
        setIsOrderAccepted(false);
      }
    } else {
      alert("Selesaikan verifikasi atribut terlebih dahulu untuk mulai menerima pesanan.");
    }
  };

  useEffect(() => {
    if (!isOnline) return;
    
    const checkOrder = () => {
      const orderStr = localStorage.getItem('simulated_incoming_order');
      if (orderStr) {
        try {
          const order = JSON.parse(orderStr);
          // If order is less than 5 minutes old
          if (Date.now() - order.timestamp < 300000) {
            setIncomingOrder(prev => {
              // If it's a new order or we don't have one yet
              if (!prev || prev.id !== order.id) {
                setIsOrderAccepted(order.accepted || false);
                return order;
              }
              return prev;
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    const interval = setInterval(checkOrder, 2000); // poll every 2s
    return () => clearInterval(interval);
  }, [isOnline]);

  const [showAcceptPill, setShowAcceptPill] = useState(false);

  const acceptOrder = () => {
    setIsOrderAccepted(true);
    if (incomingOrder) {
      if (incomingOrder.service === 'Antar Barang') {
        const updated = { ...incomingOrder, accepted: true, driverPhase: 'accepted' };
        localStorage.setItem('simulated_incoming_order', JSON.stringify(updated));
        setIncomingOrder(updated);
        
        setShowAcceptPill(true);
        setTimeout(() => {
          setShowAcceptPill(false);
          // Manually do the state update instead of handlePhaseChange because it might conflict with timeout closures
          const nextUpdate = { ...updated, driverPhase: 'heading_to_store' };
          localStorage.setItem('simulated_incoming_order', JSON.stringify(nextUpdate));
          setIncomingOrder(nextUpdate);
        }, 2000);
      } else {
        const updated = { ...incomingOrder, accepted: true, driverPhase: 'heading_to_store' };
        localStorage.setItem('simulated_incoming_order', JSON.stringify(updated));
        setIncomingOrder(updated);
      }
    }
  };

  const [showCompletionPill, setShowCompletionPill] = useState(false);

  const handlePhaseChange = (newPhase) => {
    if (incomingOrder) {
      const updated = { ...incomingOrder, driverPhase: newPhase };
      localStorage.setItem('simulated_incoming_order', JSON.stringify(updated));
      setIncomingOrder(updated);
      
      if (newPhase === 'completed') {
        setShowCompletionPill(true);
        setTimeout(() => {
          setShowCompletionPill(false);
          setIncomingOrder(null);
          setIsOrderAccepted(false);
          localStorage.removeItem('simulated_incoming_order');
        }, 2000);
      }
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(number);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
          setViewState(prev => ({
            ...prev,
            longitude,
            latitude
          }));
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (status === 'active') {
      const timer = setTimeout(() => {
        setStatus('hidden');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="mitra-dashboard-container">
      {/* Map Background */}
      <div className="mdash-map-container">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          {userLocation && (
            <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
              {isOrderAccepted && incomingOrder?.driverPhase !== 'completed' ? (
                <div className="mdash-scooter-marker">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#034078"/>
                    <text x="12" y="16" textAnchor="middle" fontSize="14" fill="white">🛵</text>
                  </svg>
                </div>
              ) : (
                <div className="mdash-center-marker">
                  <div className="mdash-marker-dot"></div>
                  <div className="mdash-marker-pulse"></div>
                </div>
              )}
            </Marker>
          )}

          {isOrderAccepted && incomingOrder?.driverPhase !== 'completed' && userLocation && (
            (() => {
              let targetCoords = null;
              if (incomingOrder.driverPhase === 'heading_to_store') {
                targetCoords = { lng: 119.4950, lat: -5.1290 }; // Store
              } else if (incomingOrder.driverPhase === 'heading_to_customer') {
                targetCoords = { lng: 119.5015, lat: -5.1382 }; // Customer
              }

              return targetCoords ? (
                <>
                  <Marker longitude={targetCoords.lng} latitude={targetCoords.lat} anchor="bottom">
                    <div className="mdash-store-pin">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#034078">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                  </Marker>
                  
                  <Source id="route" type="geojson" data={{
                    type: 'Feature',
                    geometry: {
                      type: 'LineString',
                      coordinates: [
                        [userLocation.longitude, userLocation.latitude],
                        [targetCoords.lng, targetCoords.lat]
                      ]
                    }
                  }}>
                    <Layer
                      id="route-layer"
                      type="line"
                      paint={{
                        'line-color': '#034078',
                        'line-width': 4
                      }}
                    />
                  </Source>
                </>
              ) : null;
            })()
          )}
        </Map>
      </div>

      {/* Floating Top Bar */}
      <div className="mdash-topbar">
        <div className="mdash-profile-icon">
          <User size={28} color="#94a3b8" />
        </div>
        
        <div className="mdash-status-pill">
          <span className="mdash-status-text">{isOnline ? 'Online' : 'Offline'}</span>
          <ChevronRight size={16} color="#0f172a" />
        </div>
        
        <div className={`mdash-power-icon ${isOnline ? 'online' : ''}`} onClick={toggleOnline}>
          <Power size={20} color="#ffffff" />
        </div>
      </div>

      {/* Incoming / Accepted Order Sheet */}
      {incomingOrder && (
        <div className="mdash-order-wrapper fade-up-in">
          {/* Incoming State */}
          {!isOrderAccepted && (
            <div className="mdash-order-sheet">
              <h3 className="mdash-order-title">Layanan {incomingOrder.service}</h3>
              <div className="mdash-order-content">
                <div className="mdash-order-left">
                  <p className="mdash-order-label">Diantar ke</p>
                  <h4 className="mdash-order-value">{incomingOrder.destination}</h4>
                </div>
                <div className="mdash-order-right">
                  <p className="mdash-order-label">{incomingOrder.paymentMethod === 'Bayar di Tempat' ? 'Tunai' : incomingOrder.paymentMethod}</p>
                  <h4 className="mdash-order-price">Rp {formatRupiah(incomingOrder.total)}</h4>
                </div>
              </div>
              <button className="mdash-accept-btn" onClick={acceptOrder}>
                Terima Pesanan
              </button>
              <p className="mdash-order-footer">Berjarak 500m dari lokasimu sekarang</p>
            </div>
          )}

          {/* Accepted State */}
          {isOrderAccepted && incomingOrder.driverPhase !== 'completed' && (
            <div className="mdash-order-sheet accepted">
              <h3 className="mdash-order-title">Layanan {incomingOrder.service}</h3>
              <div className="mdash-order-content no-margin-bottom">
                <div className="mdash-order-left">
                  <p className="mdash-order-label">Diantar ke</p>
                  {incomingOrder.service === 'Antar Barang' ? (
                    <h4 className="mdash-order-value" style={{ color: '#034078', display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600' }}>{incomingOrder.receiverName || 'Hana'}</span> <span style={{ color: '#94a3b8' }}>|</span> <span>{incomingOrder.destination}</span>
                    </h4>
                  ) : (
                    <h4 className="mdash-order-value">{incomingOrder.destination}</h4>
                  )}
                </div>
                <div className="mdash-order-actions">
                  <button className="mdash-icon-btn"><Phone size={18} color="#034078" fill="#034078" /></button>
                  <button className="mdash-icon-btn"><MessageCircle size={18} color="#034078" fill="#034078" /></button>
                </div>
              </div>
              
              {incomingOrder.service === 'Antar Barang' ? (
                <div className="mdash-order-details-section">
                  <p className="mdash-order-label">Detail paket</p>
                  <h4 className="mdash-order-value text-medium">{incomingOrder.category || 'Pakaian'}, {incomingOrder.size || 'Kecil'} ({incomingOrder.weight || '4'}kg)</h4>
                </div>
              ) : (
                <div className="mdash-order-details-section">
                  <p className="mdash-order-label">Pesanan</p>
                  <h4 className="mdash-order-value text-medium">Ayam Bakar Paha Atas (2), Ayam Bakar Dada (4)</h4>
                </div>
              )}

              {/* Conditional Buttons based on Phase and Service */}
              {incomingOrder.driverPhase === 'heading_to_store' && (
                <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('at_store')}>
                  {incomingOrder.service === 'Antar Barang' ? 'Barang diserahkan' : 'Sudah di toko'}
                </button>
              )}
              {incomingOrder.driverPhase === 'at_store' && (
                <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('heading_to_customer')}>
                  Menuju Lokasi
                </button>
              )}
              {incomingOrder.driverPhase === 'heading_to_customer' && (
                <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('arrived_at_customer')}>
                  Sudah di lokasi tujuan
                </button>
              )}
              {incomingOrder.driverPhase === 'arrived_at_customer' && (
                <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('completed')}>
                  Pesanan Selesai
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Accept Pill for Antar Barang */}
      {showAcceptPill && (
        <div className="mdash-order-wrapper fade-blur-out" style={{ bottom: '260px' }}>
          <div className="mdash-accepted-pill" style={{ backgroundColor: '#ffffff', color: '#10b981', fontWeight: '500', display: 'flex', gap: '8px', alignItems: 'center', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '10px 20px', borderRadius: '30px' }}>
            <div style={{ backgroundColor: '#10b981', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={14} color="#ffffff" />
            </div>
            <span>Pesanan diterima</span>
          </div>
        </div>
      )}

      {/* Completion Pill */}
      {showCompletionPill && (
        <div className="mdash-order-wrapper fade-blur-out">
          <div className="mdash-accepted-pill" style={{ backgroundColor: '#ffffff', color: '#034078', fontWeight: '500', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#22c55e', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={14} color="#ffffff" />
            </div>
            <span>Pesanan selesai, hebat!</span>
          </div>
        </div>
      )}

      {/* Alert Box */}
      {status !== 'hidden' && (
        <div 
          className={`mdash-alert-box ${status === 'active' ? 'active fade-up-out' : ''}`}
          onClick={handleAlertClick}
        >
          {status === 'pending' ? (
            <>
              <AlertCircle size={20} color="#eab308" className="mdash-alert-icon" />
              <p className="mdash-alert-text">
                Pengiriman atribut akan segera diproses. Untuk saat ini, kamu belum bisa menerima pesanan ya. Jelajahi handygo dan lengkapi profil dulu yuk!
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} color="#22c55e" className="mdash-alert-icon" />
              <p className="mdash-alert-text">
                Pengiriman atribut telah selesai dan akun kamu sudah aktif! Yuk mulai perjalanan pertamamu.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
