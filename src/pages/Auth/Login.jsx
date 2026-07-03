import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('email'); // 'email' or 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  
  // Mock login function for testing
  const handleLogin = (e) => {
    e.preventDefault();
    
    // For demonstration: route based on input email
    if (loginType === 'email') {
      if (email.includes('mitra')) navigate('/mitra');
      else if (email.includes('admin')) navigate('/admin');
      else navigate('/customer');
    } else {
      navigate('/customer');
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
        <h1 className="login-title">Masuk</h1>

        <div className="toggle-container">
          <button 
            className={`toggle-btn ${loginType === 'email' ? 'active' : 'inactive'}`}
            onClick={() => setLoginType('email')}
          >
            Email
          </button>
          <button 
            className={`toggle-btn ${loginType === 'phone' ? 'active' : 'inactive'}`}
            onClick={() => setLoginType('phone')}
          >
            No hp
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {loginType === 'email' ? (
            <>
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
              
              <div className="forgot-password">
                Lupa kata sandi?
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">No. Hp</label>
                <div className="input-wrapper">
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="Masukkan no. hp" 
                    required 
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            Masuk
          </button>
        </form>

        <div className="social-login-section">
          <p className="social-text">atau masuk dengan</p>
          
          <div className="social-icons">
            <button className="social-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button className="social-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" fill="#1877F2"/>
              </svg>
            </button>
          </div>
          
          <p className="register-text">
            Belum memiliki akun? <span className="register-link" onClick={() => navigate('/register')}>Daftar</span>
          </p>
        </div>
      </div>
    </div>
  );
}
