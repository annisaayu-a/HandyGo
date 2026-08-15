import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PartnerRegister.css';
import './Welcome.css';

export default function PartnerRegister() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    if (!phone) {
      alert('Masukkan nomor HP Anda');
      return;
    }

    if (!email) {
      alert('Masukkan Gmail Anda');
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      alert('Mohon gunakan alamat email dengan domain @gmail.com');
      return;
    }

    if (!termsAccepted) {
      alert('Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi HandyGo');
      return;
    }

    // Redirect to magic link verification screen
    navigate('/otp-verification', { 
      state: { 
        userData: { email, phone, role: 'mitra' } 
      } 
    });
  };

  return (
    <div className="partner-register-container animate-fade-in">
      {/* Wavy Background shape matching the screenshot */}
      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <button className="pr-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="#1e293b" />
      </button>

      <div className="pr-content">
        <form onSubmit={handleRegister} className="pr-form">
          <h2 className="pr-label">Masukkan No. HP</h2>
          <div className="pr-input-group">
            <div className="pr-prefix">
              <img src="https://flagcdn.com/w20/id.png" alt="ID" style={{ width: '20px', borderRadius: '2px', marginRight: '6px' }} /> +62
            </div>
            <input 
              type="tel" 
              placeholder="8123456789" 
              className="pr-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <h2 className="pr-label">Masukkan Gmail</h2>
          <div className="pr-input-group">
            <input 
              type="email" 
              placeholder="Masukkan email" 
              className="pr-input pr-input-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="pr-checkbox-container">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="pr-checkbox"
            />
            <span className="pr-checkbox-text">
              Saya setuju dengan <a href="#">Syarat & Ketentuan</a> serta <a href="#">Kebijakan Privasi</a> HandyGo
            </span>
          </label>
        </form>
      </div>

      <div className="pr-bottom-action">
        <button 
          className="pr-submit-btn" 
          onClick={handleRegister}
        >
          Daftar
        </button>
      </div>
    </div>
  );
}
