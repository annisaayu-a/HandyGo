import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';
import './Login.css';
import './OTPVerification.css';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, source } = location.state || {};
  
  // Firebase OTP is always 6 digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('Menginisialisasi sistem pengiriman SMS...');
  
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Create reCAPTCHA and send SMS when component mounts
  useEffect(() => {
    if (!userData || !userData.phone_number) {
      navigate('/register');
      return;
    }

    // Timer countdown
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }

    sendOTP();

    return () => clearInterval(timer);
  }, [navigate, userData]);

  const sendOTP = async () => {
    try {
      setInfo('Mengirim SMS kode OTP ke HP Anda...');
      setError('');
      
      const appVerifier = window.recaptchaVerifier;
      // Convert to international format if not already
      let phoneNumber = userData.phone_number;
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+62' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setInfo('SMS berhasil dikirim! Silakan periksa HP Anda.');
      setCountdown(60); // Reset timer
    } catch (err) {
      console.error(err);
      setError('Error Firebase: ' + (err.message || 'Gagal mengirim SMS'));
      setInfo('');
    }
  };

  const handleResend = () => {
    if (countdown === 0) {
      sendOTP();
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
      // 1. Verify OTP with Firebase
      if (!window.confirmationResult) {
        throw new Error("Sesi tidak valid, silakan kirim ulang OTP.");
      }
      await window.confirmationResult.confirm(enteredCode);
      
      // 2. If Firebase success, register/login in our backend
      if (source === 'register') {
        const response = await fetch('https://handygo-api.vercel.app/api/auth/register', {
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
          setError(data.error || 'Terjadi kesalahan saat pendaftaran');
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
      setError('Kode OTP salah atau kedaluwarsa.');
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
      {/* Container for invisible reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <button className="auth-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="#1e293b" />
      </button>

      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <div className="login-content animate-fade-in">
        <h1 className="login-title">Masukkan Kode OTP</h1>
        <p className="otp-subtitle">
          Dikirim ke <strong>{userData?.phone_number}</strong>
        </p>

        {info && !error && <p style={{ color: '#0ea5e9', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center' }}>{info}</p>}
        {error && <p className="otp-error-text">{error}</p>}

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
              style={{ width: '40px', height: '48px', fontSize: '1.25rem', padding: '0' }}
            />
          ))}
        </div>

        <p className="otp-resend-text" style={{ marginTop: '24px' }}>
          Kirim ulang kode <span 
            className="otp-timer" 
            onClick={handleResend}
            style={{ cursor: countdown === 0 ? 'pointer' : 'default', textDecoration: countdown === 0 ? 'underline' : 'none' }}
          >
            {countdown > 0 ? formatTime(countdown) : 'Sekarang'}
          </span>
        </p>

        <button 
          className="submit-btn" 
          style={{ marginTop: '32px' }}
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? 'Memverifikasi...' : 'Verifikasi Firebase'}
        </button>
      </div>
    </div>
  );
}
