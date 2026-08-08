import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Login.css';
import './OTPVerification.css'; // specific overrides

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, source } = location.state || {};
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [showPopup, setShowPopup] = useState(false);
  const [dummyCode] = useState('4770');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (!userData) {
      navigate('/register');
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Simulate receiving SMS after 3 seconds
    const smsTimer = setTimeout(() => {
      setShowPopup(true);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(smsTimer);
    };
  }, [navigate, userData]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Only take last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Auto-focus previous input on backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleUseDetectedCode = () => {
    setOtp(dummyCode.split(''));
    setShowPopup(false);
  };

  const handleVerify = async () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 4) {
      setError('Masukkan 4 digit kode OTP');
      return;
    }
    
    setError('');
    setIsVerifying(true);

    try {
      if (source === 'register') {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            full_name: userData.full_name, 
            email: userData.email, 
            phone_number: userData.phone_number, 
            password: userData.password 
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Terjadi kesalahan saat verifikasi');
          setIsVerifying(false);
          return;
        }

        // Save user to localStorage
        const user = { name: data.user.full_name, email: data.user.email, id: data.user.id };
        localStorage.setItem('handyGoUser', JSON.stringify(user));
        localStorage.setItem('handyGoToken', data.token);
        
        navigate('/customer');
      } else {
        // Fallback if accessed from somewhere else
        navigate('/customer');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="login-container">
      {/* Background overlay for bottom sheet */}
      {showPopup && <div className="otp-popup-overlay" onClick={() => setShowPopup(false)}></div>}

      {/* Back Button */}
      <button className="auth-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="#1e293b" />
      </button>

      {/* Wavy Header Background */}
      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <div className="login-content animate-fade-in">
        <h1 className="login-title">Masukkan Kode OTP</h1>
        <p className="otp-subtitle">
          Dikirim ke <strong>{userData?.phone_number || '+62 853 4375 0155'}</strong>
        </p>

        <div className="otp-inputs-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="tel"
              className="otp-input"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>

        {error && <p className="otp-error-text">{error}</p>}

        <p className="otp-resend-text">
          Kirim ulang kode <span className="otp-timer">{formatTime(countdown)}</span>
        </p>

        <button 
          className="submit-btn" 
          style={{ marginTop: '32px' }}
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
        </button>

        <div className="social-login-section" style={{ marginTop: '24px' }}>
          <p className="social-text">atau masuk dengan</p>
          <div className="social-icons">
            <button className="social-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            </button>
            <button className="social-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" fill="#1877F2" /></svg>
            </button>
          </div>
          <p className="register-text">
            Sudah memiliki akun? <span className="register-link" onClick={() => navigate('/login')}>Masuk</span>
          </p>
        </div>
      </div>

      {/* Auto-detect Popup Bottom Sheet */}
      <div className={`otp-popup ${showPopup ? 'show' : ''}`}>
        <p className="popup-text">Kode OTP ditemukan. Gunakan ini untuk verifikasi?</p>
        <button className="submit-btn" onClick={handleUseDetectedCode}>
          Gunakan
        </button>
      </div>
    </div>
  );
}
