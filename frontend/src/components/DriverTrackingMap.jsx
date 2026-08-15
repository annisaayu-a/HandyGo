import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import './DriverTrackingMap.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Default Makassar area coordinates if none provided
const DEFAULT_PICKUP = { lat: -5.1610, lng: 119.4310 };
const DEFAULT_DROPOFF = { lat: -5.1478, lng: 119.4320 };

/**
 * DriverTrackingMap — Reusable animated driver tracking map.
 *
 * Props:
 *   pickupCoords  : { lat, lng } — Driver starts here
 *   dropoffCoords : { lat, lng } — Driver ends here
 *   isActive      : boolean     — Start animation when true
 *   height        : string      — CSS height (default '240px')
 */
export default function DriverTrackingMap({
  pickupCoords,
  dropoffCoords,
  isActive = true,
  height = '240px'
}) {
  const mapRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const pickup = pickupCoords || DEFAULT_PICKUP;
  const dropoff = dropoffCoords || DEFAULT_DROPOFF;

  // Duration of driver animation in milliseconds (2 minutes)
  const ANIMATION_DURATION = 120000;

  // Interpolate between two points
  const interpolate = (t) => {
    return {
      lat: pickup.lat + (dropoff.lat - pickup.lat) * t,
      lng: pickup.lng + (dropoff.lng - pickup.lng) * t,
    };
  };

  const [driverPos, setDriverPos] = useState(pickup);
  const [progress, setProgress] = useState(0); // 0 → 1
  const [routeData, setRouteData] = useState(null);

  // Fetch real route from Mapbox Directions API
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          setRouteData(data.routes[0].geometry);
        }
      })
      .catch(() => {
        // Fallback: straight line GeoJSON
        setRouteData({
          type: 'LineString',
          coordinates: [
            [pickup.lng, pickup.lat],
            [dropoff.lng, dropoff.lat]
          ]
        });
      });
  }, [pickup.lat, pickup.lng, dropoff.lat, dropoff.lng]);

  // Animate driver along the route
  useEffect(() => {
    if (!isActive) return;

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const t = Math.min(elapsed / ANIMATION_DURATION, 1);
      
      setProgress(t);
      const pos = interpolate(t);
      setDriverPos(pos);

      // Smoothly pan the map to follow driver
      if (mapRef.current && t < 1) {
        mapRef.current.easeTo({
          center: [pos.lng, pos.lat],
          duration: 800,
          essential: false
        });
      }

      if (t < 1) {
        animFrameRef.current = setTimeout(animate, 1500);
      }
    };

    // Start after a short delay
    animFrameRef.current = setTimeout(animate, 800);

    return () => {
      if (animFrameRef.current) clearTimeout(animFrameRef.current);
    };
  }, [isActive]);

  // Route line layer style
  const routeLayer = {
    id: 'driver-route',
    type: 'line',
    paint: {
      'line-color': '#034078',
      'line-width': 4,
      'line-dasharray': [2, 1.5],
      'line-opacity': 0.85
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  };

  // Completed path (lighter color behind driver)
  const completedLayer = {
    id: 'driver-route-completed',
    type: 'line',
    paint: {
      'line-color': '#94a3b8',
      'line-width': 3,
      'line-opacity': 0.5
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  };

  // Calculate heading for driver icon rotation
  const heading = Math.atan2(
    dropoff.lng - pickup.lng,
    dropoff.lat - pickup.lat
  ) * (180 / Math.PI);

  return (
    <div className="driver-tracking-map-wrapper" style={{ height }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: pickup.lng,
          latitude: pickup.lat,
          zoom: 15
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        interactive={true}
        attributionControl={false}
      >
        {/* Route line (full path) */}
        {routeData && (
          <Source id="full-route" type="geojson" data={{ type: 'Feature', geometry: routeData }}>
            <Layer {...routeLayer} />
          </Source>
        )}

        {/* Pickup marker (green) */}
        <Marker longitude={pickup.lng} latitude={pickup.lat} anchor="center">
          <div className="dtm-pickup-marker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="white" fillOpacity="0.6"/>
            </svg>
          </div>
        </Marker>

        {/* Dropoff marker (dark) */}
        <Marker longitude={dropoff.lng} latitude={dropoff.lat} anchor="center">
          <div className="dtm-dropoff-marker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
        </Marker>

        {/* Driver marker (animated) */}
        <Marker longitude={driverPos.lng} latitude={driverPos.lat} anchor="center">
          <div
            className="dtm-driver-marker"
            style={{ transform: `rotate(${heading}deg)` }}
          >
            {/* Motor/bike icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#034078"/>
              <text x="12" y="17" textAnchor="middle" fontSize="12" fill="white">🏍</text>
            </svg>
            <div className="dtm-driver-pulse" />
          </div>
        </Marker>
      </Map>

      {/* Progress bar at bottom of map */}
      <div className="dtm-progress-bar-wrapper">
        <div className="dtm-progress-bar">
          <div
            className="dtm-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="dtm-progress-label">
          {progress < 1
            ? `Driver dalam perjalanan... ${Math.round(progress * 100)}%`
            : '✅ Driver tiba di tujuan!'}
        </span>
      </div>
    </div>
  );
}
