import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import './Login.css';

export default function PhoneRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    if (step === 3) {
      const registerUser = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: name, phone_number: phone, password: 'otp-login' })
          });
          const data = await response.json();
          if (response.ok) {
            const user = { name: data.user.full_name, phone: data.user.phone_number, id: data.user.id };
            localStorage.setItem('handyGoUser', JSON.stringify(user));
            localStorage.setItem('handyGoToken', data.token);
          } else {
            console.error('Registration failed:', data.error);
          }
        } catch (err) {
          console.error('Failed to connect to backend', err);
        }
      };
      
      registerUser().then(() => {
        setTimeout(() => {
          navigate('/customer');
        }, 2000);
      });
    }
  }, [step, navigate, name, phone]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!phone.startsWith('08')) {
        setPhoneError('Nomor telepon harus diawali 08');
        return;
      }
      if (phone.length < 10 || phone.length > 15) {
        setPhoneError('Nomor telepon harus terdiri dari 10-15 angka');
        return;
      }
      setPhoneError('');
      setStep(2);
      setCountdown(15 * 60); // reset countdown
    } else if (step === 2) {
      // Validate OTP here in a real app
      setStep(3);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // keep only last char if they type fast
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleResend = () => {
    if (countdown === 0) {
      setCountdown(15 * 60);
      setOtp(['', '', '', '']);
      otpRefs[0].current.focus();
    }
  };

  return (
    <div className="login-container">
      {/* Wavy Header Background */}
      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <div className="login-content animate-fade-in">
        {step !== 3 && <h1 className="login-title">Daftar</h1>}

        <form className="login-form" onSubmit={handleNextStep}>
          
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Nama</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Masukkan nama" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">No. Hp</label>
                <div className="input-wrapper">
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="Contoh: 08123456789" 
                    value={phone}
                    onChange={(e) => {
                      // Only allow numbers
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                      if (phoneError) setPhoneError('');
                    }}
                    required 
                  />
                </div>
                {phoneError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '4px 0 0' }}>{phoneError}</p>}
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
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Dikirim ke <span style={{ color: '#034078', fontWeight: '600' }}>{phone || '+62 812 1234 5678'}</span></p>
              </div>

              <div className="otp-container">
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
                    required
                  />
                ))}
              </div>

              <p className="resend-text">
                Kirim ulang kode <span className="resend-time" onClick={handleResend} style={{ cursor: countdown === 0 ? 'pointer' : 'default', textDecoration: countdown === 0 ? 'underline' : 'none' }}>
                  {countdown > 0 ? formatTime(countdown) : 'Sekarang'}
                </span>
              </p>

              <button type="submit" className="submit-btn">
                Daftar
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in" style={{ width: '100%', marginTop: '40px' }}>
              <div className="success-icon-container">
                <div style={{ 
                  backgroundColor: '#16a34a', 
                  width: '140px', 
                  height: '140px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(22, 163, 74, 0.3)'
                }}>
                  <Check size={80} color="white" strokeWidth={4} />
                </div>
              </div>
              <h2 className="success-title">Sukses!</h2>
            </div>
          )}
        </form>

        {step !== 3 && (
          <div className="social-login-section" style={{ position: 'absolute', bottom: '40px', width: '100%', left: '0' }}>
            <p className="register-text">
              Sudah memiliki akun? <span className="register-link" onClick={() => navigate('/login')}>Masuk</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
