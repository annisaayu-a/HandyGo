import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Info, Bike, Car } from 'lucide-react';
import './PartnerData.css';

export default function PartnerData() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicle } = location.state || { vehicle: 'motor' }; // Default to motor if direct navigation

  const [fullName, setFullName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankInfo, setBankInfo] = useState('');

  // Simulate bank account check
  useEffect(() => {
    if (accountNumber.length >= 10) {
      const nameToUse = fullName.trim() || 'Joko Prasetyo';
      setBankInfo(`BNI A.n ${nameToUse}`);
    } else {
      setBankInfo('');
    }
  }, [accountNumber, fullName]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (fullName && accountNumber) {
      setIsSubmitting(true);
      const existing = JSON.parse(localStorage.getItem('mitra_profile_data') || '{}');
      
      try {
        if (existing.phone) {
          await fetch('https://handygo-api.vercel.app/api/auth/mitra/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone_number: existing.phone.replace('+62', '8'),
              full_name: fullName
            })
          });
        }
      } catch (error) {
        console.error('Error updating mitra profile:', error);
      }

      // Save mitra profile data to localStorage for use in profile pages
      localStorage.setItem('mitra_profile_data', JSON.stringify({
        ...existing,
        name: fullName,
        vehicle: vehicle,
        jenisMitra: vehicle === 'motor' ? 'Mitra Motor' : 'Mitra Mobil',
      }));
      setIsSubmitting(false);
      navigate('/partner-upload', { state: { vehicle } });
    }
  };

  return (
    <div className="partner-data-container animate-fade-in">
      <div className="pd-header">
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="pd-title">Pendaftaran Mitra HandyGo</h1>
      </div>

      <div className="pd-content">
        <h2 className="pd-section-title">Mendaftar Sebagai</h2>
        
        <div className="pd-vehicle-card">
          <div className="pd-vehicle-icon-container">
            {vehicle === 'motor' ? <Bike size={28} color="#0ea5e9" /> : <Car size={28} color="#0ea5e9" />}
          </div>
          <div className="pd-vehicle-info">
            <h3 className="pd-vehicle-name">
              {vehicle === 'motor' ? 'Mitra Motor' : 'Mitra Mobil'}
            </h3>
            <p className="pd-vehicle-desc">
              {vehicle === 'motor' 
                ? 'Belanja, Antar Barang, Antar Jemput' 
                : 'Antar Jemput dan Pindahan'}
            </p>
          </div>
          <button className="pd-ganti-btn" onClick={() => navigate(-1)}>
            Ganti
          </button>
        </div>

        <div className="pd-info-banner">
          <Info size={16} color="#94a3b8" className="pd-info-icon" />
          <span className="pd-info-text">
            Isi data diri berikut sesuai dengan data diri calon mitra kami ya!
          </span>
        </div>

        <div className="pd-form">
          <div className="pd-form-group">
            <label className="pd-label">Nama Lengkap</label>
            <input 
              type="text" 
              className="pd-input" 
              placeholder="Cth: Budiono Siregar" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <span className="pd-helper-text">Masukkan nama yang sesuai dengan KTP.</span>
          </div>

          <div className="pd-form-group">
            <label className="pd-label">Nomor Rekening</label>
            <div className="pd-input-wrapper">
              <input 
                type="text" 
                className="pd-input" 
                placeholder="Cth: 7993121730" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={20}
              />
              {bankInfo && (
                <span className="pd-bank-info">{bankInfo}</span>
              )}
            </div>
            <span className="pd-helper-text">
              Untuk pencairan dana dari Haku (Dompet HandyGo) ke rekening.
            </span>
          </div>
        </div>
      </div>

      <div className="pd-bottom-action">
        <button 
          className={`pd-submit-btn ${(!fullName || !accountNumber) ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!fullName || !accountNumber}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
