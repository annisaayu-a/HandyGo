import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import ktpMock from '../../assets/ktp_mock.png';
import './PartnerCamera.css';

export default function PartnerCamera() {
  const navigate = useNavigate();
  // 'scan' | 'error' | 'success'
  const [scanState, setScanState] = useState('scan');

  useEffect(() => {
    // Simulasi alur scanning KTP
    const timer1 = setTimeout(() => {
      setScanState('error'); // Munculkan error setelah 2 detik
    }, 2000);

    const timer2 = setTimeout(() => {
      setScanState('success'); // Munculkan sukses KTP terbaca setelah 4 detik
    }, 4000);

    const timer3 = setTimeout(() => {
      // Kembali ke halaman upload setelah sukses loading 2 detik
      navigate('/partner-upload', { state: { ktpVerified: true } });
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="partner-camera-container animate-fade-in">
      <div className="pc-overlay">
        <p className="pc-instruction">Sesuaikan e-KTP di dalam kotak ya!</p>
        
        <div className="pc-cutout-container">
          <div className="pc-cutout-frame">
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
                <img src={ktpMock} alt="Mock KTP" className="pc-ktp-image" />
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

        {/* Error Message Pill */}
        {scanState === 'error' && (
          <div className="pc-error-pill animate-slide-up">
            <div className="pc-error-icon">
              <Info size={14} color="#ffffff" />
            </div>
            <span>Buram nih, coba pegang HP dengan lebih stabil</span>
          </div>
        )}
      </div>
    </div>
  );
}
