import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';
import './Login.css';

export default function PhoneRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // Firebase OTP is 6 digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [info, setInfo] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const sendOTP = async () => {
    try {
      setupRecaptcha();
      setInfo('Mengirim SMS OTP...');
      const appVerifier = window.recaptchaVerifier;
      
      let phoneNumber = phone.startsWith('0') ? '+62' + phone.slice(1) : (phone.startsWith('+') ? phone : '+' + phone);
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setInfo('SMS berhasil dikirim! Silakan periksa pesan masuk.');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      console.error(err);
      setPhoneError('Gagal mengirim SMS. Pastikan nomor valid.');
      setStep(1);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!phone || phone === '+62') {
        setPhoneError('No. Hp tidak boleh kosong.');
        return;
      }
      setPhoneError('');
      sendOTP();
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs[index + 1].current.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    if(e) e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setInfo('Masukkan 6 digit kode OTP');
      return;
    }
    
    setIsVerifying(true);
    setInfo('Memverifikasi kode Firebase...');

    try {
      if (!window.confirmationResult) throw new Error("Sesi tidak valid");
      await window.confirmationResult.confirm(enteredCode);
      
      // Verification success, register in backend
      const response = await fetch('https://handygo-api.vercel.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, phone_number: phone, password: 'otp-login' })
      });
      const data = await response.json();
      
      if (response.ok) {
        const user = { name: data.user.full_name, phone: data.user.phone_number, id: data.user.id };
        localStorage.setItem('handyGoUser', JSON.stringify(user));
        localStorage.setItem('handyGoToken', data.token);
        navigate('/customer');
      } else {
        setInfo(data.error || 'Gagal mendaftar di server.');
        setIsVerifying(false);
      }
    } catch (err) {
      console.error(err);
      setInfo('Kode OTP salah atau kedaluwarsa.');
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (countdown === 0) sendOTP();
  };

  return (
    <div className="login-container">
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
        <h1 className="login-title">Daftar OTP Firebase</h1>

        <form className="login-form" onSubmit={step === 1 ? handleNextStep : handleVerifyOTP}>
          
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Nama</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input" placeholder="Masukkan nama" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">No. Hp</label>
                <div className={`input-wrapper phone-input-wrapper ${phoneError ? 'has-error' : ''}`} style={{ display: 'flex', alignItems: 'center', borderRadius: '12px', padding: '0 16px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                  <div className="phone-prefix" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', fontWeight: '600', color: '#1e293b' }}>
                    <img src="https://flagcdn.com/w20/id.png" alt="ID" style={{ width: '20px', borderRadius: '2px' }} />
                    +62
                  </div>
                  <input 
                    type="tel" 
                    className="form-input phone-input-no-shadow" 
                    placeholder="8123456789" 
                    value={phone.startsWith('+62') ? phone.slice(3) : phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.startsWith('0')) val = val.slice(1);
                      setPhone('+62' + val);
                      if (phoneError) setPhoneError('');
                    }}
                    style={{ border: 'none', backgroundColor: 'transparent', padding: '14px 0', flex: 1, outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                {phoneError && <p className="field-error-text">{phoneError}</p>}
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '24px' }}>
                Lanjut
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h3 style={{ color: '#034078', fontFamily: 'Outfit', fontWeight: '700', margin: '0 0 4px 0', fontSize: '1.2rem' }}>Masukkan Kode OTP</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Dikirim ke <span style={{ color: '#034078', fontWeight: '600' }}>{phone}</span></p>
                {info && <p style={{ color: '#0ea5e9', fontSize: '0.85rem', marginTop: '4px' }}>{info}</p>}
              </div>

              <div className="otp-container" style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="otp-input"
                    style={{ width: '35px', height: '45px', padding: 0 }}
                    required
                  />
                ))}
              </div>

              <p className="resend-text">
                Kirim ulang kode <span className="resend-time" onClick={handleResend} style={{ cursor: countdown === 0 ? 'pointer' : 'default', textDecoration: countdown === 0 ? 'underline' : 'none' }}>
                  {countdown > 0 ? formatTime(countdown) : 'Sekarang'}
                </span>
              </p>

              <button type="submit" className="submit-btn" disabled={isVerifying}>
                {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
