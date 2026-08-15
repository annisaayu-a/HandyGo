import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PartnerRegister.css';

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

    // Success simulation
    alert('Pendaftaran Mitra Berhasil (Simulasi)!');
    // navigate('/partner-dashboard') // Future routing
  };

  return (
    <div className="partner-register-container animate-fade-in">
      {/* Wavy Background shape matching the screenshot */}
      <div className="pr-wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="pr-wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,0L1440,0L1440,192C1320,192,1200,64,1080,64C960,64,840,192,720,192C600,192,480,64,360,64C240,64,120,192,60,256L0,320Z"></path>
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
              <span className="pr-flag">🇮🇩</span> +62
            </div>
            <input 
              type="tel" 
              placeholder="cth: 85912741xxx" 
              className="pr-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <h2 className="pr-label">Masukkan Gmail</h2>
          <div className="pr-input-group">
            <input 
              type="email" 
              placeholder="cth: namamu@gmail.com" 
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
