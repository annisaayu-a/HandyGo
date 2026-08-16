import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, RefreshCw } from 'lucide-react';
import './PartnerCamera.css';

export default function PartnerCamera() {
  const navigate = useNavigate();
  const location = useLocation();
  const docType = location.state?.docType || 'ktp';
  const vehicle = location.state?.vehicle || 'motor';
  const ktpVerified = location.state?.ktpVerified;
  const simVerified = location.state?.simVerified;

  const cameraInputRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Trigger native OS camera app - no browser permission required
  const handleOpenCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Reset input so the same file can be re-selected
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    if (docType === 'ktp') {
      localStorage.setItem('handyGoKtpPhoto', capturedImage);
      navigate('/partner-upload', {
        state: { ktpVerified: true, ktpPhoto: capturedImage, simVerified, vehicle }
      });
    } else if (docType === 'sim') {
      localStorage.setItem('handyGoSimPhoto', capturedImage);
      navigate('/partner-upload', {
        state: { ktpVerified, simVerified: true, simPhoto: capturedImage, vehicle }
      });
    }
  };

  const label = docType === 'ktp' ? 'e-KTP' : 'SIM';

  return (
    <div className="partner-camera-container animate-fade-in">
      {/* Hidden input - uses OS native camera, no browser permission needed */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {capturedImage ? (
        /* ── Preview screen ── */
        <div style={{
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1.5rem',
          paddingTop: '3.5rem',
          gap: '1.25rem'
        }}>
          <button
            className="pc-back-btn"
            onClick={handleRetake}
            style={{ position: 'static', alignSelf: 'flex-start' }}
          >
            <ChevronLeft size={32} color="#ffffff" />
          </button>

          <p style={{ color: '#fff', fontWeight: '600', fontSize: '1rem', textAlign: 'center' }}>
            Pastikan foto {label} terlihat jelas
          </p>

          <img
            src={capturedImage}
            alt={`Foto ${label}`}
            style={{
              width: '100%',
              maxHeight: '55vh',
              objectFit: 'contain',
              borderRadius: '14px',
              border: '2px solid #0ea5e9'
            }}
          />

          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: 'auto' }}>
            <button
              onClick={handleRetake}
              style={{
                flex: 1,
                padding: '14px',
                background: 'transparent',
                border: '2px solid #475569',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} /> Ulangi
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 2,
                padding: '14px',
                background: '#034078',
                border: 'none',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Gunakan Foto Ini
            </button>
          </div>
        </div>
      ) : (
        /* ── Instruction / trigger screen ── */
        <div className="pc-overlay" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '2rem',
          textAlign: 'center',
          background: '#0f172a'
        }}>
          <button className="pc-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={32} color="#ffffff" />
          </button>

          {/* Document frame illustration */}
          <div style={{
            width: '260px',
            height: '175px',
            border: '3px dashed #0ea5e9',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(14, 165, 233, 0.05)',
            position: 'relative'
          }}>
            {/* Corner accents */}
            {[
              { top: -3, left: -3, borderTop: '4px solid #0ea5e9', borderLeft: '4px solid #0ea5e9', borderRadius: '4px 0 0 0' },
              { top: -3, right: -3, borderTop: '4px solid #0ea5e9', borderRight: '4px solid #0ea5e9', borderRadius: '0 4px 0 0' },
              { bottom: -3, left: -3, borderBottom: '4px solid #0ea5e9', borderLeft: '4px solid #0ea5e9', borderRadius: '0 0 0 4px' },
              { bottom: -3, right: -3, borderBottom: '4px solid #0ea5e9', borderRight: '4px solid #0ea5e9', borderRadius: '0 0 4px 0' },
            ].map((style, i) => (
              <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...style }} />
            ))}
            <Camera size={48} color="#0ea5e9" strokeWidth={1.5} />
          </div>

          <div>
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Foto {label} Anda
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Sesuaikan {label} di dalam bingkai, pastikan tidak buram dan pencahayaan cukup
            </p>
            {docType === 'sim' && (
              <p style={{ color: '#fbbf24', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                ⚠️ Gunakan SIM yang sesuai jenis kendaraan yang Anda daftarkan
              </p>
            )}
          </div>

          {/* Tips */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            width: '100%',
            textAlign: 'left'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: 1.8 }}>
              ✅ Dokumen asli, bukan fotokopi<br />
              ✅ Foto tidak buram atau terpotong<br />
              ✅ Pencahayaan cukup terang
            </p>
          </div>

          <button
            onClick={handleOpenCamera}
            style={{
              width: '100%',
              padding: '16px',
              background: '#034078',
              border: 'none',
              color: '#fff',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 20px rgba(3,64,120,0.4)'
            }}
          >
            <Camera size={20} />
            Buka Kamera
          </button>
        </div>
      )}
    </div>
  );
}
