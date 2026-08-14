import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import './Login.css'; // Reusing the same CSS classes for identical layout structures

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // clear previous errors
    
    // Validasi format email ketat (harus gmail)
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      setError('Hanya akun @gmail.com yang diizinkan (contoh: nama@gmail.com)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak sesuai');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('https://handygo-api.vercel.app/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Gagal mengirim OTP ke email');
        setIsSubmitting(false);
        return;
      }
      
      // Navigate to OTP page with otpToken
      navigate('/otp-verification', { 
        state: { 
          userData: { full_name: name, email, phone_number: phone, password },
          otpToken: data.otpToken,
          source: 'register'
        } 
      });
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungi server');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
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
        <h1 className="login-title">Daftar</h1>

        <form className="login-form" onSubmit={handleRegister}>
          <div className="form-group">
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
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                className="form-input" 
                placeholder="Masukkan email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Nomor Telepon</label>
            <div className={`input-wrapper phone-input-wrapper`} style={{ display: 'flex', alignItems: 'center', borderRadius: '12px', padding: '0 16px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
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
                  if (error) setError('');
                }}
                style={{ border: 'none', backgroundColor: 'transparent', padding: '14px 0', flex: 1, outline: 'none', boxShadow: 'none' }}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="Masukkan kata sandi" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Konfirmasi Kata Sandi</label>
            <div className="input-wrapper">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="Masukkan kata sandi" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="submit-btn" style={{ marginTop: '8px' }} disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="social-login-section" style={{ marginTop: '0' }}>
          <p className="register-text" style={{ marginBottom: '12px' }}>
            Sudah memiliki akun? <span className="register-link" onClick={() => navigate('/login')}>Masuk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
