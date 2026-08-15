import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, ChevronLeft } from 'lucide-react';
import ktpMock from '../../assets/ktp_mock.png';
import simMock from '../../assets/sim_mock.png';
import './PartnerCamera.css';

export default function PartnerCamera() {
  const navigate = useNavigate();
  const location = useLocation();
  const docType = location.state?.docType || 'ktp';
  const vehicle = location.state?.vehicle || 'motor';
  
  // existing verifications to preserve them when navigating back
  const ktpVerified = location.state?.ktpVerified;
  const simVerified = location.state?.simVerified;

  // 'scan' | 'error-blur' | 'error-type' | 'success'
  const [scanState, setScanState] = useState('scan');

  useEffect(() => {
    let timers = [];
    
    if (docType === 'ktp') {
      timers.push(setTimeout(() => setScanState('error-blur'), 2000));
      timers.push(setTimeout(() => setScanState('success'), 4000));
      timers.push(setTimeout(() => {
        navigate('/partner-upload', { state: { ktpVerified: true, simVerified, vehicle } });
      }, 6000));
    } else if (docType === 'sim') {
      if (vehicle === 'motor') {
        // Simulasi mendeteksi SIM A padahal daftar motor
        timers.push(setTimeout(() => setScanState('error-type'), 2000));
        // Setelah error, pura-puranya lanjut sukses (untuk demo UI mockup)
        timers.push(setTimeout(() => setScanState('success'), 5000));
      } else {
        timers.push(setTimeout(() => setScanState('success'), 2000));
      }
      
      timers.push(setTimeout(() => {
        navigate('/partner-upload', { state: { ktpVerified, simVerified: true, vehicle } });
      }, vehicle === 'motor' ? 7000 : 4000));
    }

    return () => timers.forEach(clearTimeout);
  }, [docType, navigate, vehicle, ktpVerified, simVerified]);

  return (
    <div className="partner-camera-container animate-fade-in">
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
          <div className={`pc-cutout-frame ${docType === 'sim' ? 'sim-frame' : ''}`}>
            {/* The 4 corners */}
            <div className="pc-corner top-left"></div>
            <div className="pc-corner top-right"></div>
            <div className="pc-corner bottom-left"></div>
            <div className="pc-corner bottom-right"></div>

            {/* Content inside cutout */}
            {scanState !== 'success' ? (
              <div className="pc-face-placeholder"></div>
            ) : (
              <div className="pc-ktp-image-wrapper">
                <img 
                  src={docType === 'ktp' ? ktpMock : simMock} 
                  alt={`Mock ${docType.toUpperCase()}`} 
                  className={`pc-ktp-image ${docType === 'sim' ? 'sim-image-adjusted' : ''}`} 
                />
              </div>
            )}
          </div>
          
          {/* Loading indicator when success */}
          {scanState === 'success' && (
            <div className="pc-loading-indicator">
              <svg className="pc-spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
            </div>
          )}
        </div>

        {/* Error Message Pill - Blur */}
        {scanState === 'error-blur' && (
          <div className="pc-error-pill animate-slide-up">
            <div className="pc-error-icon">
              <Info size={14} color="#ffffff" />
            </div>
            <span>Buram nih, coba pegang HP dengan lebih stabil</span>
          </div>
        )}

        {/* Error Message Pill - Type Mismatch */}
        {scanState === 'error-type' && (
          <div className="pc-error-pill animate-slide-up">
            <div className="pc-error-icon">
              <Info size={14} color="#ffffff" />
            </div>
            <span>SIM A terdeteksi. Gunakan SIM C untuk pendaftaran Mitra Motor.</span>
          </div>
        )}
      </div>
    </div>
  );
}
