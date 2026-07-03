import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css'; // Reusing the same CSS classes for identical layout structures

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleRegister = (e) => {
    e.preventDefault();
    setError(''); // clear previous errors
    
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak sesuai dengan kata sandi.');
      return;
    }
    
    // Save mock user to localStorage
    const user = { name, email, password };
    localStorage.setItem('handyGoUser', JSON.stringify(user));
    
    // Redirect to login after register
    navigate('/login');
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

          <button type="submit" className="submit-btn" style={{ marginTop: '8px' }}>
            Daftar
          </button>
        </form>

        <div className="social-login-section" style={{ marginTop: '0' }}>
          <p className="register-text" style={{ marginBottom: '12px' }}>
            Sudah memiliki akun? <span className="register-link" onClick={() => navigate('/login')}>Masuk</span>
          </p>
          <p className="social-text" style={{ marginBottom: '12px' }}>atau</p>
          <p className="register-text">
            Daftar dengan <span className="register-link">No. Handphone</span>
          </p>
        </div>
      </div>
    </div>
  );
}
