import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Login.css';
import './OTPVerification.css';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, otpToken, source } = location.state || {};
  
  // OTP is 6 digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('Kode OTP telah dikirim ke email Anda.');
  
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (!userData || !userData.email) {
      navigate('/register');
      return;
    }

    // Timer countdown
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userData]);

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setInfo('Mengirim ulang OTP ke email...');
    setError('');
    
    try {
      const response = await fetch('https://handygo-api.vercel.app/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Gagal mengirim ulang OTP');
        setInfo('');
        return;
      }
      
      // Update otpToken in history state quietly
      window.history.replaceState({
        ...window.history.state,
        usr: {
          ...window.history.state.usr,
          otpToken: data.otpToken
        }
      }, '');
      
      // Also update location state object reference for current render
      location.state.otpToken = data.otpToken;

      setInfo('OTP baru berhasil dikirim!');
      setCountdown(60);
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server');
      setInfo('');
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }
    
    setError('');
    setIsVerifying(true);
    setInfo('Memverifikasi kode...');

    try {
      if (source === 'register') {
        const response = await fetch('https://handygo-api.vercel.app/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            full_name: userData.full_name, 
            email: userData.email, 
            phone_number: userData.phone_number, 
            password: userData.password,
            otpToken: location.state?.otpToken || otpToken,
            otpCode: enteredCode
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Kode OTP salah atau terjadi kesalahan');
          setIsVerifying(false);
          setInfo('');
          return;
        }

        const user = { name: data.user.full_name, email: data.user.email, phone: data.user.phone_number, id: data.user.id };
        localStorage.setItem('handyGoUser', JSON.stringify(user));
        localStorage.setItem('handyGoToken', data.token);
        
        navigate('/customer');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server.');
      setIsVerifying(false);
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

      <div className="login-content animate-fade-in">
        <h1 className="login-title">Verifikasi Akun</h1>
        <p className="otp-subtitle">
          Kode telah dikirim ke email <strong>{userData?.email}</strong>
        </p>

        {info && !error && <p style={{ color: '#0ea5e9', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center' }}>{info}</p>}
        {error && <p className="otp-error-text">{error}</p>}

        <div className="otp-inputs-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              className="otp-input"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{ width: '40px', height: '48px', fontSize: '1.25rem', padding: '0' }}
            />
          ))}
        </div>

        <p className="otp-resend-text" style={{ marginTop: '24px' }}>
          Belum menerima email? <span 
            className="otp-timer" 
            onClick={handleResend}
            style={{ cursor: countdown === 0 ? 'pointer' : 'default', textDecoration: countdown === 0 ? 'underline' : 'none' }}
          >
            {countdown > 0 ? `Tunggu ${formatTime(countdown)}` : 'Kirim Ulang'}
          </span>
        </p>
        <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>
          *Cek folder Spam jika email tidak masuk
        </p>

        <button 
          className="submit-btn" 
          style={{ marginTop: '24px' }}
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? 'Memverifikasi...' : 'Verifikasi OTP'}
        </button>
      </div>
    </div>
  );
}
