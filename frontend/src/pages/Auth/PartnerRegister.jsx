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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setEmailError('');
    let hasError = false;

    if (!phone) {
      setPhoneError('Nomor HP tidak boleh kosong');
      hasError = true;
    } else if (!phone.startsWith('8')) {
      setPhoneError('Nomor HP harus diawali dengan angka 8');
      hasError = true;
    }

    if (!email) {
      setEmailError('Gmail tidak boleh kosong');
      hasError = true;
    } else if (!email.toLowerCase().endsWith('@gmail.com')) {
      setEmailError('Mohon gunakan alamat email dengan domain @gmail.com');
      hasError = true;
    }

    if (hasError) return;

    if (!termsAccepted) {
      alert('Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi HandyGo');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://handygo-api.vercel.app/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: 'Calon Mitra HandyGo', 
          email, 
          phone_number: phone, 
          password: 'MitraPassword123', // Dummy password to satisfy backend requirements
          role: 'mitra'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Gagal mengirim tautan ke email');
        setIsSubmitting(false);
        return;
      }

      // Save registration date to simulate persistent deadline
      localStorage.setItem('partnerRegistrationDate', new Date().toISOString());

      // Save phone and email to mitra_profile_data for profile page use
      const existing = JSON.parse(localStorage.getItem('mitra_profile_data') || '{}');
      localStorage.setItem('mitra_profile_data', JSON.stringify({
        ...existing,
        phone: '+62' + phone,
        email: email,
      }));

      // Redirect to magic link verification screen
      navigate('/otp-verification', { 
        state: { 
          userData: { email, phone, role: 'mitra' } 
        } 
      });
    } catch (error) {
      alert('Terjadi kesalahan jaringan, silakan coba lagi');
      setIsSubmitting(false);
    }
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
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ''));
                setPhoneError('');
              }}
            />
          </div>
          {phoneError && <p className="pr-error-text animate-fade-in">{phoneError}</p>}

          <h2 className="pr-label">Masukkan Gmail</h2>
          <div className="pr-input-group">
            <input 
              type="email" 
              placeholder="Masukkan email" 
              className="pr-input pr-input-full"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />
          </div>
          {emailError && <p className="pr-error-text animate-fade-in">{emailError}</p>}

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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mengirim...' : 'Daftar'}
        </button>
      </div>
    </div>
  );
}
