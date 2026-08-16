import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, RefreshCw, ShieldCheck, CameraOff } from 'lucide-react';
import './PartnerCamera.css';

// Permission states
const STATE_ASK = 'ask';       // Explain why we need camera, show "Aktifkan Kamera"
const STATE_LOADING = 'loading'; // Requesting permission / starting stream
const STATE_LIVE = 'live';     // Camera is active and streaming
const STATE_DENIED = 'denied'; // Permission was denied
const STATE_PREVIEW = 'preview'; // Photo taken, showing preview

export default function PartnerCamera() {
  const navigate = useNavigate();
  const location = useLocation();
  const docType = location.state?.docType || 'ktp';
  const vehicle = location.state?.vehicle || 'motor';
  const ktpVerified = location.state?.ktpVerified;
  const simVerified = location.state?.simVerified;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [screenState, setScreenState] = useState(STATE_ASK);
  const [capturedImage, setCapturedImage] = useState(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setScreenState(STATE_LOADING);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setScreenState(STATE_LIVE);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setScreenState(STATE_DENIED);
    }
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setCapturedImage(dataUrl);
    setScreenState(STATE_PREVIEW);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    if (docType === 'ktp') {
      localStorage.setItem('handyGoKtpPhoto', capturedImage);
      navigate('/partner-upload', { state: { ktpVerified: true, ktpPhoto: capturedImage, simVerified, vehicle } });
    } else {
      localStorage.setItem('handyGoSimPhoto', capturedImage);
      navigate('/partner-upload', { state: { ktpVerified, simVerified: true, simPhoto: capturedImage, vehicle } });
    }
  };

  const label = docType === 'ktp' ? 'e-KTP' : 'SIM';

  /* ─────────── SCREEN: Ask for permission ─────────── */
  if (screenState === STATE_ASK) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '1.5rem', paddingTop: '3.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', marginBottom: '2rem' }}>
          <ChevronLeft size={32} color="#ffffff" />
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={48} color="#0ea5e9" strokeWidth={1.5} />
          </div>

          <div>
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Izin Akses Kamera
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Untuk memfoto {label} Anda secara langsung, HandyGo memerlukan izin akses kamera perangkat.
            </p>
          </div>

          {/* Permission explanation */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1rem 1.25rem', width: '100%', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                Kamera <strong>hanya aktif</strong> saat halaman ini dibuka dan otomatis dimatikan setelah foto diambil.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                Setelah Anda mengizinkan sekali, browser akan <strong>mengingat izin ini</strong> — tidak perlu mengizinkan lagi di kunjungan berikutnya.
              </p>
            </div>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
            Saat browser menampilkan popup "Izinkan akses kamera?", pilih <strong style={{ color: '#0ea5e9' }}>Izinkan</strong>.
          </p>
        </div>

        <button
          onClick={startCamera}
          style={{ width: '100%', padding: '16px', background: '#034078', border: 'none', color: '#fff', borderRadius: '14px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <Camera size={20} /> Aktifkan Kamera
        </button>
      </div>
    );
  }

  /* ─────────── SCREEN: Permission denied ─────────── */
  if (screenState === STATE_DENIED) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: '1.25rem' }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={32} color="#ffffff" />
        </button>
        <CameraOff size={64} color="#ef4444" />
        <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1.1rem' }}>Akses Kamera Ditolak</p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7 }}>
          Untuk mengaktifkan kamera di browser, ketuk ikon <strong style={{ color: '#0ea5e9' }}>🔒 kunci / info</strong> di bilah alamat browser, lalu pilih <strong style={{ color: '#0ea5e9' }}>Izinkan</strong> pada opsi Kamera. Kemudian kembali ke sini.
        </p>
        <button
          onClick={startCamera}
          style={{ marginTop: '0.5rem', padding: '14px 28px', background: '#034078', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} /> Coba Lagi
        </button>
      </div>
    );
  }

  /* ─────────── SCREEN: Preview captured photo ─────────── */
  if (screenState === STATE_PREVIEW) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', paddingTop: '3.5rem', gap: '1.25rem' }}>
        <button onClick={handleRetake} style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
          <ChevronLeft size={32} color="#ffffff" />
        </button>
        <p style={{ color: '#fff', fontWeight: '600', fontSize: '1rem', textAlign: 'center' }}>
          Pastikan foto {label} terlihat jelas
        </p>
        <img
          src={capturedImage}
          alt={`Foto ${label}`}
          style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '14px', border: '2px solid #0ea5e9' }}
        />
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: 'auto' }}>
          <button onClick={handleRetake} style={{ flex: 1, padding: '14px', background: 'transparent', border: '2px solid #475569', color: '#fff', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Ulangi
          </button>
          <button onClick={handleConfirm} style={{ flex: 2, padding: '14px', background: '#034078', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
            Gunakan Foto Ini
          </button>
        </div>
      </div>
    );
  }

  /* ─────────── SCREEN: Loading / Live camera viewfinder ─────────── */
  return (
    <div className="partner-camera-container animate-fade-in">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="pc-overlay">
        {/* Live video - fills entire background */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />

        {/* Dark overlay with cutout */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1 }} />

        {/* Back button */}
        <button className="pc-back-btn" style={{ zIndex: 10 }} onClick={() => { stopCamera(); navigate(-1); }}>
          <ChevronLeft size={32} color="#ffffff" />
        </button>

        {/* Instruction text */}
        <p className="pc-instruction" style={{ zIndex: 10 }}>
          {docType === 'ktp' ? 'Sesuaikan e-KTP di dalam kotak ya!' : 'Sesuaikan SIM di dalam kotak ya!'}
        </p>
        {docType === 'sim' && (
          <p className="pc-sub-instruction" style={{ zIndex: 10 }}>
            Pastikan jenis SIM sesuai dengan kendaraan yang kamu daftarkan
          </p>
        )}

        {/* Document frame */}
        <div className="pc-cutout-container" style={{ zIndex: 5 }}>
          <div className={`pc-cutout-frame ${docType === 'sim' ? 'sim-frame' : ''}`}>
            <div className="pc-corner top-left"></div>
            <div className="pc-corner top-right"></div>
            <div className="pc-corner bottom-left"></div>
            <div className="pc-corner bottom-right"></div>
          </div>
        </div>

        {/* Loading spinner while camera starts */}
        {screenState === STATE_LOADING && (
          <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <svg className="pc-spinner" viewBox="0 0 50 50" style={{ width: 40, height: 40 }}>
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#0ea5e9"></circle>
            </svg>
            <p style={{ color: '#fff', fontSize: '0.875rem' }}>Membuka kamera...</p>
          </div>
        )}

        {/* Capture button */}
        {screenState === STATE_LIVE && (
          <button
            onClick={handleCapture}
            style={{
              position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, width: 72, height: 72, borderRadius: '50%',
              background: '#ffffff', border: '5px solid rgba(255,255,255,0.4)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#034078' }} />
          </button>
        )}
      </div>
    </div>
  );
}
