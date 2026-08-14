import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import './Login.css';
import './OTPVerification.css';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = location.state || {};
  
  const [countdown, setCountdown] = useState(60);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userData || !userData.email) {
      // If no user data, navigate back to register
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userData]);

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setInfo('Mengirim ulang tautan...');
    setError('');
    
    try {
      const response = await fetch('https://handygo-api.vercel.app/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Gagal mengirim ulang tautan');
        setInfo('');
        return;
      }
      
      setInfo('Tautan baru berhasil dikirim!');
      setCountdown(60);
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server');
      setInfo('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="login-container">
      <button className="auth-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="#1e293b" />
      </button>

      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <div className="login-content animate-fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#e0f2fe', padding: '1.5rem', borderRadius: '50%' }}>
            <Mail size={48} color="#0ea5e9" />
          </div>
        </div>
        
        <h1 className="login-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cek Email Anda</h1>
        
        <p className="otp-subtitle" style={{ color: '#475569', lineHeight: '1.6', marginBottom: '1rem' }}>
          Kami telah mengirimkan Tautan Ajaib (Magic Link) ke <strong>{userData?.email}</strong>. Silakan buka kotak masuk email Anda dan klik tombol <strong>Verifikasi Akun Saya</strong> untuk masuk ke aplikasi.
        </p>

        {info && !error && <p style={{ color: '#0ea5e9', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>{info}</p>}
        {error && <p className="otp-error-text" style={{ marginBottom: '16px' }}>{error}</p>}

        <p className="otp-resend-text" style={{ marginTop: '24px', fontSize: '0.9rem' }}>
          Belum menerima email? <span 
            className="otp-timer" 
            onClick={handleResend}
            style={{ 
              cursor: countdown === 0 ? 'pointer' : 'default', 
              textDecoration: countdown === 0 ? 'underline' : 'none',
              color: countdown === 0 ? '#0ea5e9' : '#94a3b8',
              fontWeight: countdown === 0 ? 'bold' : 'normal'
            }}
          >
            {countdown > 0 ? `Tunggu ${formatTime(countdown)}` : 'Kirim Ulang Email'}
          </span>
        </p>

        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
          *Cek folder Spam jika email tidak masuk dalam 1 menit.
        </p>
      </div>
    </div>
  );
}
