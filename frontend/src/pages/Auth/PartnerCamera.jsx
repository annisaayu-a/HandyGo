import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CameraOff } from 'lucide-react';
import './PartnerCamera.css';

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

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      // Prefer rear camera on mobile for document scanning
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Izin kamera ditolak. Mohon izinkan akses kamera di pengaturan browser Anda.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Kamera tidak ditemukan di perangkat ini.');
      } else {
        setCameraError('Tidak dapat mengakses kamera. Pastikan browser Anda mendukung fitur ini.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
    setIsCapturing(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCameraReady(false);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    // Save captured image to localStorage for the upload page to use
    if (docType === 'ktp') {
      localStorage.setItem('handyGoKtpPhoto', capturedImage);
      navigate('/partner-upload', { state: { ktpVerified: true, ktpPhoto: capturedImage, simVerified, vehicle } });
    } else if (docType === 'sim') {
      localStorage.setItem('handyGoSimPhoto', capturedImage);
      navigate('/partner-upload', { state: { ktpVerified, simVerified: true, simPhoto: capturedImage, vehicle } });
    }
  };

  return (
    <div className="partner-camera-container animate-fade-in">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {cameraError ? (
        <div className="pc-overlay" style={{ background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
          <button className="pc-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={32} color="#ffffff" />
          </button>
          <CameraOff size={64} color="#ef4444" />
          <p style={{ color: '#ef4444', fontWeight: '600', fontSize: '1rem' }}>Kamera tidak dapat diakses</p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{cameraError}</p>
          <button
            onClick={startCamera}
            style={{ marginTop: '1rem', padding: '12px 24px', background: '#034078', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Coba Lagi
          </button>
        </div>
      ) : capturedImage ? (
        /* Preview captured image */
        <div className="pc-overlay" style={{ background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
          <button className="pc-back-btn" onClick={handleRetake}>
            <ChevronLeft size={32} color="#ffffff" />
          </button>
          <p style={{ color: '#fff', fontWeight: '600', fontSize: '1rem', textAlign: 'center', marginTop: '3rem' }}>
            Pastikan {docType === 'ktp' ? 'e-KTP' : 'SIM'} terlihat jelas
          </p>
          <img
            src={capturedImage}
            alt="Captured document"
            style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '12px', border: '2px solid #0ea5e9' }}
          />
          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
            <button
              onClick={handleRetake}
              style={{ flex: 1, padding: '14px', background: 'transparent', border: '2px solid #64748b', color: '#fff', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Ulangi
            </button>
            <button
              onClick={handleConfirm}
              style={{ flex: 1, padding: '14px', background: '#034078', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Gunakan Foto Ini
            </button>
          </div>
        </div>
      ) : (
        /* Live camera viewfinder */
        <div className="pc-overlay">
          <button className="pc-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={32} color="#ffffff" />
          </button>

          <p className="pc-instruction">
            {docType === 'ktp' ? 'Sesuaikan e-KTP di dalam kotak ya!' : 'Sesuaikan SIM di dalam kotak ya!'}
          </p>
          {docType === 'sim' && (
            <p className="pc-sub-instruction">
              Pastikan jenis SIM sesuai dengan kendaraan yang kamu daftarkan sebagai mitra
            </p>
          )}

          <div className="pc-cutout-container">
            {/* Live video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0
              }}
            />

            <div className={`pc-cutout-frame ${docType === 'sim' ? 'sim-frame' : ''}`} style={{ zIndex: 1 }}>
              <div className="pc-corner top-left"></div>
              <div className="pc-corner top-right"></div>
              <div className="pc-corner bottom-left"></div>
              <div className="pc-corner bottom-right"></div>
            </div>

            {!cameraReady && (
              <div style={{ position: 'absolute', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <svg className="pc-spinner" viewBox="0 0 50 50" style={{ width: 40, height: 40 }}>
                  <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#0ea5e9"></circle>
                </svg>
                <p style={{ color: '#fff', fontSize: '0.875rem' }}>Membuka kamera...</p>
              </div>
            )}
          </div>

          {/* Capture button */}
          {cameraReady && (
            <div style={{ position: 'absolute', bottom: '3rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '4px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: isCapturing ? '#94a3b8' : '#034078' }} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
