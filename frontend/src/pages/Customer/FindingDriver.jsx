import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './FindingDriver.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function FindingDriver() {
  const navigate = useNavigate();
  const location = useLocation();

  const [viewState, setViewState] = useState({
    longitude: 119.4920,
    latitude: -5.1325,
    zoom: 15
  });

  const [userLocation, setUserLocation] = useState(null);

  // Retrieve routing info passed from checkout
  const nextRoute = location.state?.nextRoute || '/customer';
  const nextState = location.state?.nextState || {};

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
          setViewState(prev => ({ ...prev, longitude, latitude }));
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const checkAcceptance = () => {
      const orderStr = localStorage.getItem('simulated_incoming_order');
      if (orderStr) {
        try {
          const order = JSON.parse(orderStr);
          if (order.accepted) {
            // Mitra accepted the order! Redirect to status page
            navigate(nextRoute, { state: nextState });
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Poll every 1.5 seconds
    const interval = setInterval(checkAcceptance, 1500);
    return () => clearInterval(interval);
  }, [navigate, nextRoute, nextState]);

  const handleCancel = () => {
    // Clean up local storage simulated order
    localStorage.removeItem('simulated_incoming_order');
    navigate(-1); // Or navigate('/customer')
  };

  return (
    <div className="finding-driver-container animate-fade-in">
      <div className="fd-map-wrapper">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          {userLocation && (
            <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
              <div className="fd-center-marker">
                <div className="fd-marker-dot"></div>
                <div className="fd-marker-pulse"></div>
              </div>
            </Marker>
          )}
        </Map>
      </div>

      <div className="fd-bottom-sheet">
        <p className="fd-status-text">Sedang mencari driver terdekat</p>
        <button className="fd-cancel-btn" onClick={handleCancel}>
          Batalkan Pesanan
        </button>
      </div>
    </div>
  );
}
