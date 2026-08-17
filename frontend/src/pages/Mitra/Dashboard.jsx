import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User, Power, ChevronRight, AlertCircle, CheckCircle2, Phone, MessageCircle, Clock, Info } from 'lucide-react';
import './Dashboard.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MitraDashboard() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState({
    longitude: 119.4920,
    latitude: -5.1325,
    zoom: 14.5
  });
  
  const [userLocation, setUserLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [isOrderAccepted, setIsOrderAccepted] = useState(false);
  
  const [repairDamageLevel, setRepairDamageLevel] = useState('');
  const [repairSparepart, setRepairSparepart] = useState('');
  const [repairEstimatedTime, setRepairEstimatedTime] = useState('');

  const toggleOnline = () => {
    setIsOnline(!isOnline);
    if (isOnline) {
      // Going offline
      setIncomingOrder(null);
      setIsOrderAccepted(false);
    }
  };

  const [debugLog, setDebugLog] = useState("");

  useEffect(() => {
    if (!isOnline) {
      setDebugLog("Offline");
      return;
    }
    
    let interval;
    const checkOrder = async () => {
      // Fetch pending orders from API
      try {
        const url = `https://handygo-api.vercel.app/api/orders/pending?t=${Date.now()}`;
        setDebugLog(`Fetching: ${url}`);
        const res = await fetch(url, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setDebugLog(`Fetched OK. Orders length: ${data.orders ? data.orders.length : 0}`);
          if (data.orders && data.orders.length > 0) {
            // Get the first pending order
            const apiOrder = data.orders[0];
            
            // Format to match the frontend state expectations
            const formattedOrder = {
              id: apiOrder.id,
              service: apiOrder.service.name,
              destination: apiOrder.dropoff_location,
              paymentMethod: apiOrder.payment_method,
              total: apiOrder.estimated_price,
              timestamp: new Date(apiOrder.created_at).getTime(),
              detailPekerjaan: apiOrder.order_details,
              driverPhase: apiOrder.status === 'menunggu' ? undefined : apiOrder.status
            };

            setIncomingOrder(prev => {
              if (isOrderAccepted && prev && prev.id) {
                return prev; // Do not override if currently handling an order
              }
              if (!prev || prev.id !== formattedOrder.id) {
                setIsOrderAccepted(false);
                return formattedOrder;
              }
              return prev;
            });
          }
        } else {
          setDebugLog(`Fetch failed with status: ${res.status}`);
        }
      } catch (e) {
        console.error('Error fetching pending orders:', e);
        setDebugLog(`Fetch error: ${e.message}`);
      }
    };

    checkOrder(); // Check immediately upon going online
    interval = setInterval(checkOrder, 3000); // poll every 3s
    return () => clearInterval(interval);
  }, [isOnline, isOrderAccepted]);

  const [showAcceptPill, setShowAcceptPill] = useState(false);
  const [workingSeconds, setWorkingSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (incomingOrder?.driverPhase === 'working' && incomingOrder?.workingStartTime) {
      interval = setInterval(() => {
        setWorkingSeconds(Math.floor((Date.now() - incomingOrder.workingStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [incomingOrder?.driverPhase, incomingOrder?.workingStartTime]);

  const formatWorkingTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const acceptOrder = async () => {
    setIsOrderAccepted(true);
    if (incomingOrder) {
      try {
        let mitraId = null;
        let parsed = null;
        const savedProfile = localStorage.getItem('mitra_profile_data');
        const handyGoMitra = localStorage.getItem('handyGoMitra');
        
        if (savedProfile) {
          parsed = JSON.parse(savedProfile);
          mitraId = parsed.id;
        }
        
        if (!mitraId && handyGoMitra) {
          parsed = JSON.parse(handyGoMitra);
          mitraId = parsed.id;
        }
        
        if (!mitraId && parsed && parsed.phone) {
          const res = await fetch(`https://handygo-api.vercel.app/api/auth/mitra/profile?phone=${encodeURIComponent(parsed.phone)}`);
          if (res.ok) {
            const mData = await res.json();
            mitraId = mData.mitra.id;
            parsed.id = mitraId;
            localStorage.setItem('mitra_profile_data', JSON.stringify(parsed));
          }
        }
        
        if (!mitraId) {
          alert('Gagal mengambil profil Mitra. Pastikan Anda sudah login.');
          return;
        }

        await fetch(`https://handygo-api.vercel.app/api/orders/${incomingOrder.id}/accept`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mitra_id: mitraId })
        });
        
        // Post welcome chat message to backend instead of localStorage
        await fetch('https://handygo-api.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: incomingOrder.id,
            sender_type: 'mitra',
            text: 'Pesanan berhasil diterima.\n\nHalo, Saya sudah menerima pesanan Anda dan sedang menuju lokasi. Jika ada patokan lokasi atau informasi tambahan, silahkan sampaikan melalui chat ini ya.\n\nIni adalah pesan otomatis.'
          })
        });

      } catch (e) {
        console.error('Error accepting order via API:', e);
      }

      const updated = { ...incomingOrder, accepted: true, driverPhase: 'accepted' };
      setIncomingOrder(updated);
      
      // Save active order ID for Chat page to use
      localStorage.setItem('handygo_active_order_id', incomingOrder.id);

      setShowAcceptPill(true);
      setTimeout(async () => {
        setShowAcceptPill(false);
        const nextPhase = ['Antar Barang', 'Belanja'].includes(incomingOrder.service) ? 'heading_to_store' : 'heading_to_customer';
        const nextUpdate = { ...updated, driverPhase: nextPhase };
        setIncomingOrder(nextUpdate);
        
        try {
          await fetch(`https://handygo-api.vercel.app/api/orders/${incomingOrder.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextPhase })
          });
        } catch (e) {
          console.error('Error updating status via API:', e);
        }
      }, 3000);
    }
  };

  const [showCompletionPill, setShowCompletionPill] = useState(false);
  const [showQrisSuccessPill, setShowQrisSuccessPill] = useState(false);

  const handlePhaseChange = async (newPhase) => {
    setIncomingOrder(prev => {
      if (!prev) return prev;
      const updated = { ...prev, driverPhase: newPhase };
      if (newPhase === 'working') {
        updated.workingStartTime = Date.now();
      } else if (newPhase === 'finished_working_wait') {
        updated.totalWorkingSeconds = Math.floor((Date.now() - (prev.workingStartTime || Date.now())) / 1000);
      }
      return updated;
    });

    const orderId = incomingOrder ? incomingOrder.id : null;
    if (orderId) {
      try {
        await fetch(`https://handygo-api.vercel.app/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newPhase })
        });
      } catch (e) {
        console.error('Error updating phase via API:', e);
      }
    }
      
      if (newPhase === 'traveling_to_destination') {
        setTimeout(() => {
          handlePhaseChange('payment_confirmation');
        }, 5000);
      } else if (newPhase === 'traveling_to_customer') {
        setTimeout(() => {
          handlePhaseChange('arrived_near_customer');
        }, 5000);
      } else if (newPhase === 'finished_working_wait') {
        setTimeout(() => {
          const isQris = incomingOrder?.paymentMethod === 'QRIS';
          handlePhaseChange(isQris ? 'payment_confirmation_qris' : 'payment_confirmation');
        }, 2000);
      } else if (newPhase === 'payment_confirmation_qris') {
        setTimeout(() => {
          handlePhaseChange('payment_confirmed_qris');
          if (['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder?.service)) {
            setShowQrisSuccessPill(true);
            setTimeout(() => {
              setShowQrisSuccessPill(false);
            }, 3000);
          }
        }, 2000);
      } else if (newPhase === 'completed_qris_success') {
        setShowQrisSuccessPill(true);
        setTimeout(() => {
          setShowQrisSuccessPill(false);
          handlePhaseChange('completed');
        }, 3000);
      } else if (newPhase === 'completed') {
        setShowCompletionPill(true);
        // Update DB status to 'selesai' (completed)
        const completedOrderId = incomingOrder ? incomingOrder.id : null;
        if (completedOrderId) {
          try {
            await fetch(`https://handygo-api.vercel.app/api/orders/${completedOrderId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'selesai' })
            });
          } catch (e) {}
        }
        setTimeout(() => {
          setShowCompletionPill(false);
          setIncomingOrder(null);
          setIsOrderAccepted(false);
          localStorage.removeItem('handygo_active_order_id');
        }, 2000);
      }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
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
              } else if (incomingOrder.driverPhase === 'heading_to_customer' || incomingOrder.driverPhase === 'traveling_to_customer') {
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
        <div className="mdash-profile-icon" onClick={() => navigate('/mitra/profile')} style={{ cursor: 'pointer', overflow: 'hidden' }}>
          {(() => {
            try {
              const saved = localStorage.getItem('mitra_profile_data');
              const parsed = saved ? JSON.parse(saved) : {};
              if (parsed.avatar) {
                return <img src={parsed.avatar} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />;
              }
            } catch (e) {}
            return <User size={28} color="#94a3b8" />;
          })()}
        </div>
        
        <div className="mdash-status-pill">
          <span className="mdash-status-text">{isOnline ? 'Online' : 'Offline'}</span>
          <ChevronRight size={16} color="#0f172a" />
        </div>
        
        <div className={`mdash-power-icon ${isOnline ? 'online' : ''}`} onClick={toggleOnline}>
          <Power size={20} color="#ffffff" />
        </div>
      </div>

      {/* Bersih-Bersih detail overlay on map during incoming state */}
      {incomingOrder && !isOrderAccepted && incomingOrder.service === 'Bersih-Bersih' && (
        <div className="mdash-cleaning-overlay">
          <h4 className="mdash-cleaning-title">Detail Pesanan</h4>
          <div className="mdash-cleaning-row">
            <span>Lokasi</span>
            <span className="value">{incomingOrder.destination}</span>
          </div>
          <div className="mdash-cleaning-row">
            <span>Luas Area</span>
            <span className="value">{incomingOrder.luasArea}</span>
          </div>
          <div className="mdash-cleaning-row">
            <span>Tingkat Kekotoran</span>
            <span className="value">{incomingOrder.tingkatKekotoran}</span>
          </div>
          <div className="mdash-cleaning-row">
            <span>Estimasi Durasi</span>
            <span className="value">{incomingOrder.durasi} jam</span>
          </div>
          <div className="mdash-cleaning-row">
            <span>Jumlah Petugas</span>
            <span className="value">{incomingOrder.jumlahPetugas} orang</span>
          </div>
          <div className="mdash-cleaning-row">
            <span>Tanggal & Waktu Pemesanan</span>
            <span className="value">Rabu, 10:08</span>
          </div>
        </div>
      )}

      {/* Incoming / Accepted Order Sheet */}
      {incomingOrder && (
        <div className="mdash-order-wrapper fade-up-in">
          {incomingOrder.driverPhase === 'finished_working_wait' && (
            <div className="mdash-cleaning-info-pill" style={{ display: 'flex', gap: '10px', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '15px', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#eab308', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Clock size={14} color="#ffffff" />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>Menunggu konfirmasi pelanggan</span>
            </div>
          )}
          {incomingOrder.driverPhase === 'payment_confirmation' && (
            <div className="mdash-cleaning-info-pill" style={{ display: 'flex', gap: '10px', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '15px', alignItems: 'flex-start', maxWidth: '320px' }}>
              <div style={{ backgroundColor: '#eab308', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <Info size={14} color="#ffffff" />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', fontWeight: '500' }}>Dibayarkan dengan metode Tunai.<br/>{incomingOrder.service === 'Antar Jemput' ? 'Hanya selesaikan pesanan jika' : 'Hanya konfirmasi jika pembayaran'}<br/>{incomingOrder.service === 'Antar Jemput' ? 'pembayaran sudah kamu terima' : 'sudah kamu terima'}</span>
            </div>
          )}
          {incomingOrder.driverPhase === 'payment_confirmation_qris' && (
            <div className="mdash-cleaning-info-pill" style={{ display: 'flex', gap: '10px', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '15px', alignItems: 'flex-start', maxWidth: '320px' }}>
              <div style={{ backgroundColor: '#eab308', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <Info size={14} color="#ffffff" />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', fontWeight: '500' }}>Dibayarkan dengan metode QRIS.<br/>Tunggu sebentar sampai kami<br/>mengonfirmasi pembayarannya</span>
            </div>
          )}
          {['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) && incomingOrder.driverPhase === 'arrived_at_customer' && (
            <div className="mdash-cleaning-info-pill" style={{ display: 'flex', gap: '10px', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '15px', alignItems: 'flex-start', maxWidth: '320px' }}>
              <div style={{ backgroundColor: '#eab308', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <Clock size={14} color="#ffffff" />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', fontWeight: '500', display: 'flex', alignItems: 'center' }}>Lakukan pengecekan terlebih dahulu<br/>sebelum lanjut</span>
            </div>
          )}
          {/* Incoming State */}
          {!isOrderAccepted && (
            <div className="mdash-order-sheet">
              <h3 className="mdash-order-title">Layanan {incomingOrder.service}</h3>
              <div className="mdash-order-content" style={{ marginBottom: ['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? '12px' : '20px' }}>
                <div className="mdash-order-left">
                  <p className="mdash-order-label">{['Bersih-Bersih', 'Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? 'Lokasi' : 'Diantar ke'}</p>
                  <h4 className="mdash-order-value">{incomingOrder.destination}</h4>
                </div>
                <div className="mdash-order-right">
                  <p className="mdash-order-label">{['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? 'Estimasi' : (incomingOrder.paymentMethod === 'Bayar di Tempat' ? 'Tunai' : incomingOrder.paymentMethod)}</p>
                  <h4 className="mdash-order-price" style={['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? { color: '#034078', fontWeight: '700' } : {}}>{['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? (incomingOrder.service === 'Perbaikan Elektronik' ? 'Rp 280.000 - 380.000' : 'Rp 80.000 - 120.000') : `Rp ${formatRupiah(incomingOrder.total)}`}</h4>
                </div>
              </div>
              
              {['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) && (
                <div className="mdash-order-details-section" style={{ marginBottom: '16px' }}>
                  <p className="mdash-order-label">Detail pekerjaan</p>
                  <h4 className="mdash-order-value text-medium">
                    {incomingOrder.detailPekerjaan || (incomingOrder.service === 'Perbaikan Elektronik' ? 'Mesin Cuci' : 'Saklar rusak')}<br/>
                    Tingkat kerusakan {incomingOrder.tingkatKerusakan || (incomingOrder.service === 'Perbaikan Elektronik' ? 'berat' : 'sedang')}
                  </h4>
                </div>
              )}

              <button className="mdash-accept-btn" onClick={acceptOrder}>
                Terima Pesanan
              </button>
              <p className="mdash-order-footer">{['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? 'Berjarak 1km dari lokasimu sekarang' : incomingOrder.service === 'Antar Jemput' ? 'Berjarak 100m dari lokasimu sekarang' : 'Berjarak 500m dari lokasimu sekarang'}</p>
            </div>
          )}

          {/* Accepted State */}
          {/* Accepted State */}
          {isOrderAccepted && incomingOrder.driverPhase !== 'completed' && incomingOrder.driverPhase !== 'completed_qris_success' && incomingOrder.driverPhase !== 'traveling_to_customer' && (
            <div className="mdash-order-sheet accepted">
              <h3 className="mdash-order-title">Layanan {incomingOrder.service}</h3>
              <div className="mdash-order-content no-margin-bottom">
                <div className="mdash-order-left">
                  <p className="mdash-order-label">{['Bersih-Bersih', 'Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? 'Lokasi' : 'Diantar ke'}</p>
                  {incomingOrder.service === 'Antar Barang' ? (
                    <h4 className="mdash-order-value" style={{ color: '#034078', display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600' }}>{incomingOrder.receiverName || 'Hana'}</span> <span style={{ color: '#94a3b8' }}>|</span> <span>{incomingOrder.destination}</span>
                    </h4>
                  ) : (
                    <h4 className="mdash-order-value">{incomingOrder.destination}</h4>
                  )}
                </div>
                {incomingOrder.service === 'Antar Jemput' ? (
                  <div className="mdash-order-right">
                    <p className="mdash-order-label">{incomingOrder.paymentMethod === 'Bayar di Tempat' ? 'Tunai' : incomingOrder.paymentMethod}</p>
                    <h4 className="mdash-order-price">Rp {formatRupiah(incomingOrder.total)}</h4>
                  </div>
                ) : (
                  <div className="mdash-order-actions">
                  <button className="mdash-icon-btn" onClick={() => navigate('/mitra/call')}><Phone size={18} color="#034078" fill="#034078" /></button>
                  <button className="mdash-icon-btn" onClick={() => navigate('/mitra/chat', { state: { orderId: incomingOrder.id } })}><MessageCircle size={18} color="#034078" fill="#034078" /></button>
                  </div>
                )}
              </div>
              
              {incomingOrder.service === 'Antar Barang' ? (
                <div className="mdash-order-details-section">
                  <p className="mdash-order-label">Detail paket</p>
                  <h4 className="mdash-order-value text-medium">{incomingOrder.category || 'Pakaian'}, {incomingOrder.size || 'Kecil'} ({incomingOrder.weight || '4'}kg)</h4>
                </div>
              ) : ['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? (
                <div className="mdash-order-details-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: incomingOrder.driverPhase === 'arrived_at_customer' ? '16px' : '0' }}>
                    <div>
                      <p className="mdash-order-label">Detail pekerjaan</p>
                      <h4 className="mdash-order-value text-medium">
                        {incomingOrder.detailPekerjaan || (incomingOrder.service === 'Perbaikan Elektronik' ? 'Mesin Cuci' : 'Saklar rusak')}<br/>
                        Tingkat kerusakan {incomingOrder.tingkatKerusakan || (incomingOrder.service === 'Perbaikan Elektronik' ? 'berat' : 'sedang')}
                      </h4>
                    </div>
                  </div>
                  {incomingOrder.driverPhase === 'arrived_at_customer' && (
                    <div className="mdash-checking-form">
                      <p className="mdash-order-value" style={{ fontWeight: '600', marginBottom: '16px' }}>Masukkan detail perbaikan</p>
                      
                      <p className="mdash-order-label" style={{ marginBottom: '8px' }}>Tingkat Kerusakan</p>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        {['Ringan', 'Sedang', 'Berat'].map(level => (
                          <button
                            key={level}
                            onClick={() => setRepairDamageLevel(level)}
                            style={{
                              flex: 1, padding: '8px 0', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '0.85rem',
                              backgroundColor: repairDamageLevel === level ? '#e2e8f0' : '#ffffff',
                              color: '#334155', cursor: 'pointer'
                            }}
                          >
                            {level}
                          </button>
                        ))}
                      </div>

                      <p className="mdash-order-label" style={{ marginBottom: '8px' }}>Masukkan sparepart / material jika ada</p>
                      <input 
                        type="text" 
                        placeholder="Cth. Sekrup" 
                        value={repairSparepart}
                        onChange={(e) => setRepairSparepart(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '16px', boxSizing: 'border-box' }}
                      />

                      <p className="mdash-order-label" style={{ marginBottom: '8px' }}>Estimasi waktu pengerjaan</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['< 30 menit', '< 1 jam', '> 1 jam'].map(time => (
                          <button
                            key={time}
                            onClick={() => setRepairEstimatedTime(time)}
                            style={{
                              flex: 1, padding: '8px 0', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '0.85rem',
                              backgroundColor: repairEstimatedTime === time ? '#e2e8f0' : '#ffffff',
                              color: '#334155', cursor: 'pointer'
                            }}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {['finished_working_wait', 'payment_confirmation', 'payment_confirmed', 'working'].includes(incomingOrder.driverPhase) && (
                    <div style={{ marginTop: '16px' }}>
                      <p className="mdash-order-label">Detail perbaikan</p>
                      <h4 className="mdash-order-value text-medium">
                        {repairSparepart || (incomingOrder.service === 'Perbaikan Elektronik' ? 'Sabuk Penggerak' : 'Saklar seri, Sekrup, dan Bracket')}<br/>
                        Waktu mengerjakan {repairEstimatedTime || (incomingOrder.service === 'Perbaikan Elektronik' ? '< 1 jam' : '< 30 menit')}
                      </h4>
                      <div style={{ marginTop: '16px' }}>
                        <p className="mdash-order-label">Total</p>
                        <h4 className="mdash-order-value" style={{ color: '#034078', fontWeight: '700' }}>
                          {incomingOrder.service === 'Perbaikan Elektronik' ? 'Rp 400.000' : 'Rp 125.000'}
                        </h4>
                      </div>
                    </div>
                  )}
                </div>
              ) : incomingOrder.service === 'Bersih-Bersih' ? (
                <div className="mdash-order-details-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="mdash-order-label">Detail pekerjaan</p>
                    <h4 className="mdash-order-value text-medium">
                      Luas area {incomingOrder.luasArea}<br/>
                      Tingkat kekotoran {incomingOrder.tingkatKekotoran?.toLowerCase()}
                    </h4>
                  </div>
                  {['finished_working_wait', 'payment_confirmation', 'payment_confirmed', 'payment_confirmation_qris', 'payment_confirmed_qris', 'completed_qris_success'].includes(incomingOrder.driverPhase) && (
                    <div style={{ textAlign: 'right' }}>
                      <p className="mdash-order-label">Total</p>
                      <h4 className="mdash-order-value" style={{ color: '#034078', fontWeight: '700' }}>
                        Rp {formatRupiah(incomingOrder.total)}
                      </h4>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mdash-order-details-section">
                  <p className="mdash-order-label">Pesanan</p>
                  <h4 className="mdash-order-value text-medium">
                    {(() => {
                      try {
                        const items = JSON.parse(incomingOrder.detailPekerjaan);
                        if (Array.isArray(items)) {
                          return items.map(item => `${item.name} (${item.quantity})`).join(', ');
                        }
                        return incomingOrder.detailPekerjaan;
                      } catch (e) {
                        return incomingOrder.detailPekerjaan || 'Item Pesanan';
                      }
                    })()}
                  </h4>
                </div>
              )}

              {/* Conditional Buttons based on Phase and Service */}
              {incomingOrder.driverPhase === 'heading_to_store' && (
                <button className="mdash-at-store-btn" onClick={() => handlePhaseChange(incomingOrder.service === 'Antar Barang' ? 'traveling_to_customer' : 'at_store')}>
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
                  {incomingOrder.service === 'Antar Jemput' ? 'Sudah di Lokasi' : 'Sudah di lokasi tujuan'}
                </button>
              )}
              {incomingOrder.driverPhase === 'arrived_near_customer' && (
                <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('arrived_at_customer')}>
                  Sudah di lokasi tujuan
                </button>
              )}
              {incomingOrder.driverPhase === 'arrived_at_customer' && (
                <button className="mdash-at-store-btn" onClick={() => handlePhaseChange(incomingOrder.service === 'Antar Jemput' ? 'traveling_to_destination' : incomingOrder.service === 'Bersih-Bersih' ? 'working' : ['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? 'finished_working_wait' : 'completed')}>
                  {incomingOrder.service === 'Antar Jemput' ? 'Menuju Lokasi' : incomingOrder.service === 'Bersih-Bersih' ? 'Mulai Mengerjakan' : ['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) ? 'Pengecekan Selesai' : 'Pesanan Selesai'}
                </button>
              )}
              {incomingOrder.driverPhase === 'working' && (
                incomingOrder.service === 'Bersih-Bersih' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="mdash-at-store-btn" style={{ flex: 1, backgroundColor: '#7895b2', cursor: 'default' }}>
                      {formatWorkingTime(workingSeconds)}
                    </button>
                    <button className="mdash-at-store-btn" style={{ flex: 1 }} onClick={() => handlePhaseChange('finished_working_wait')}>
                      Selesai
                    </button>
                  </div>
                ) : (
                  <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('completed')}>
                    Pesanan Selesai
                  </button>
                )
              )}
              {incomingOrder.service === 'Bersih-Bersih' && ['finished_working_wait', 'payment_confirmation_qris'].includes(incomingOrder.driverPhase) && (
                <button className="mdash-at-store-btn" style={{ backgroundColor: '#7895b2', cursor: 'default' }}>
                  {formatWorkingTime(incomingOrder.totalWorkingSeconds || workingSeconds)}
                </button>
              )}
              {['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder.service) && ['finished_working_wait', 'payment_confirmation_qris'].includes(incomingOrder.driverPhase) && (
                <button className="mdash-at-store-btn" style={{ backgroundColor: '#a8a29e', cursor: 'not-allowed' }}>
                  Mulai Mengerjakan
                </button>
              )}
              {incomingOrder.driverPhase === 'payment_confirmation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {incomingOrder.service === 'Bersih-Bersih' ? (
                    <button className="mdash-at-store-btn" style={{ backgroundColor: '#7895b2', cursor: 'default' }}>
                      {formatWorkingTime(incomingOrder.totalWorkingSeconds || workingSeconds)}
                    </button>
                  ) : incomingOrder.service === 'Antar Jemput' ? (
                    <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('completed')}>
                      Pesanan Selesai
                    </button>
                  ) : (
                    <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('payment_confirmed')}>
                      Pembayaran Terkonfirmasi
                    </button>
                  )}
                  {incomingOrder.service === 'Bersih-Bersih' ? (
                    <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('payment_confirmed')}>
                      Pembayaran Terkonfirmasi
                    </button>
                  ) : incomingOrder.service === 'Antar Jemput' ? null : (
                    <button className="mdash-at-store-btn" style={{ backgroundColor: '#a8a29e', cursor: 'not-allowed' }}>
                      Mulai Mengerjakan
                    </button>
                  )}
                </div>
              )}
              {['payment_confirmed', 'payment_confirmed_qris'].includes(incomingOrder.driverPhase) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {incomingOrder.service === 'Bersih-Bersih' ? (
                    <>
                      <button className="mdash-at-store-btn" style={{ backgroundColor: '#7895b2', cursor: 'default' }}>
                        {formatWorkingTime(incomingOrder.totalWorkingSeconds || workingSeconds)}
                      </button>
                      <button className="mdash-at-store-btn" onClick={() => handlePhaseChange(incomingOrder.driverPhase === 'payment_confirmed_qris' ? 'completed_qris_success' : 'completed')}>
                        Pesanan Selesai
                      </button>
                    </>
                  ) : (
                    <button className="mdash-at-store-btn" onClick={() => handlePhaseChange('working')}>
                      Mulai Mengerjakan
                    </button>
                  )}
                </div>
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

      {/* QRIS Success Pill */}
      {showQrisSuccessPill && (
        <div className="mdash-order-wrapper fade-blur-out" style={{ bottom: '260px' }}>
          <div className="mdash-accepted-pill" style={{ backgroundColor: '#ffffff', color: '#334155', fontWeight: '500', display: 'flex', gap: '8px', alignItems: 'center', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px 24px', borderRadius: '30px' }}>
            <div style={{ backgroundColor: '#22c55e', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={14} color="#ffffff" />
            </div>
            <span>{['Perbaikan Kelistrikan', 'Perbaikan Elektronik'].includes(incomingOrder?.service) ? 'Pembayaran terkonfirmasi' : 'Pembayaran berhasil'}</span>
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

    </div>
  );
}
