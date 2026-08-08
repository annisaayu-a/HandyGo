import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import './DeliverySender.css';

export default function DeliverySender() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get locations from state, or fallback to mock data
  const pickup = location.state?.pickup || { name: 'Universitas Hasanuddin Fak...', address: 'Jl. Perintis Kemerdekaan' };
  const dropoff = location.state?.dropoff || { name: 'Pondok Nabil', address: 'Jl. Sahabat' };

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('0')) value = value.substring(1);
    if (value.startsWith('62')) value = value.substring(2);
    setSenderPhone(value);
  };

  const isFormValid = senderName.trim() !== '' && senderPhone.length >= 9;

  const handleNext = () => {
    if (!isFormValid) return;
    
    navigate('/customer/delivery/checkout', { 
      state: { 
        ...location.state, 
        senderName, 
        senderPhone 
      } 
    });
  };

  return (
    <div className="delivery-receiver-container animate-fade-in">
      <header className="receiver-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="header-title">Antar Barang</h1>
      </header>

      <div className="receiver-content">
        {/* Location Summary Card */}
        <div className="location-summary-card">
          <p className="summary-helper-text">Pastikan titik sudah sesuai ya!</p>
          
          <div className="location-point">
            <div className="point-header">
              <h3 className="point-title">Lokasi Pengambilan</h3>
              <button className="change-btn" onClick={() => navigate(-2)}>Ganti lokasi</button>
            </div>
            <p className="point-address">{pickup.name}</p>
          </div>

          <div className="location-point">
            <div className="point-header">
              <h3 className="point-title">Lokasi Pengantaran</h3>
              <button className="change-btn" onClick={() => navigate(-2)}>Ganti lokasi</button>
            </div>
            <p className="point-address">{dropoff.name}</p>
          </div>

          <div className="detail-input-wrapper">
            <Edit2 size={16} color="#94a3b8" className="detail-icon" />
            <input 
              type="text" 
              className="detail-input"
              placeholder="Tambahin detail lokasi yuk!"
              readOnly
            />
          </div>
        </div>

        {/* Sender Details */}
        <section className="receiver-section">
          <h2 className="section-title">Detail Pengirim</h2>
          
          <div className="input-group">
            <input 
              type="text" 
              className="receiver-input"
              placeholder="Masukkan nama pengirim"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>

          <div className="phone-input-group">
            <div className="country-code">
              <img src="https://flagcdn.com/w20/id.png" alt="ID" className="flag-icon" />
              <span>+62</span>
            </div>
            <input 
              type="tel" 
              className="receiver-phone-input"
              placeholder="Masukkan nomor telepon"
              value={senderPhone}
              onChange={handlePhoneChange}
            />
          </div>
        </section>
      </div>

      <div className="bottom-action">
        <button 
          className="next-btn" 
          disabled={!isFormValid}
          onClick={handleNext}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
