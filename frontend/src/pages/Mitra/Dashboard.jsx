import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User, Power, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  const handleAlertClick = () => {
    if (status === 'pending') {
      setStatus('active');
    }
  };

  useEffect(() => {
    // Get real user location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
          // Optionally center map on first load
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
              <div className="mdash-center-marker">
                <div className="mdash-marker-dot"></div>
                <div className="mdash-marker-pulse"></div>
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Floating Top Bar */}
      <div className="mdash-topbar">
        <div className="mdash-profile-icon">
          <User size={28} color="#94a3b8" />
        </div>
        
        <div className="mdash-status-pill">
          <span className="mdash-status-text">Offline</span>
          <ChevronRight size={16} color="#0f172a" />
        </div>
        
        <div className="mdash-power-icon">
          <Power size={20} color="#ffffff" />
        </div>
      </div>

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
