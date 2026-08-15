import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Bike, Car } from 'lucide-react';
import './PartnerVehicle.css';

export default function PartnerVehicle() {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const handleNext = () => {
    if (selectedVehicle) {
      navigate('/partner-data', { state: { vehicle: selectedVehicle } });
    }
  };

  return (
    <div className="partner-vehicle-container animate-fade-in">
      <div className="pv-header">
        <span className="pv-subtitle">Pendaftaran Mitra HandyGo</span>
        <h1 className="pv-title">Selamat datang di pendaftaran Mitra Handygo</h1>
        <p className="pv-description">
          Kamu satu langkah lebih dekat untuk resmi menjadi mitra HandyGo, yuk ikuti langkah selanjutnya!
        </p>
      </div>

      <div className="pv-content">
        <h2 className="pv-question">Mau jadi Mitra apa</h2>

        <div 
          className={`pv-card ${selectedVehicle === 'motor' ? 'selected' : ''}`}
          onClick={() => setSelectedVehicle('motor')}
        >
          <div className="pv-card-icon-container">
            <Bike size={32} color="#0ea5e9" />
          </div>
          <div className="pv-card-text">
            <h3 className="pv-card-title">Mitra Motor</h3>
            <p className="pv-card-desc">Kamu bisa ambil orderan Belanja, Antar Barang, Antar Jemput</p>
          </div>
        </div>

        <div 
          className={`pv-card ${selectedVehicle === 'mobil' ? 'selected' : ''}`}
          onClick={() => setSelectedVehicle('mobil')}
        >
          <div className="pv-card-icon-container">
            <Car size={32} color="#0ea5e9" />
          </div>
          <div className="pv-card-text">
            <h3 className="pv-card-title">Mitra Mobil</h3>
            <p className="pv-card-desc">Kamu bisa ambil orderan Antar Jemput dan Pindahan</p>
          </div>
        </div>

        <div className="pv-info-section">
          <Info size={16} color="#94a3b8" className="pv-info-icon" />
          <span className="pv-info-text">
            Beberapa layanan lain hanya boleh diambil sesuai dengan keahlian yang dapat kamu masukkan setelah pendaftaran akun.
          </span>
        </div>
      </div>

      <div className="pv-bottom-action">
        <button 
          className={`pv-submit-btn ${!selectedVehicle ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!selectedVehicle}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
