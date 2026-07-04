import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit3 } from 'lucide-react';
import './ShoppingDetails.css';

export default function ShoppingDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve passed state from map, or use fallbacks if accessed directly
  const { toko, pengantaran } = location.state || {
    toko: { name: 'Kost Ernias' },
    pengantaran: { name: 'Universitas Hasanuddin Kampus FAK...' }
  };

  const [pesanan, setPesanan] = useState('');
  const [estimasiHarga, setEstimasiHarga] = useState('');

  return (
    <div className="shopping-details-page animate-fade-in">
      {/* Header */}
      <header className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="details-title">Belanja</h1>
      </header>

      <main className="details-content">
        {/* Location Summary Card */}
        <div className="summary-card">
          <p className="summary-subtitle">Pastikan titik sudah sesuai ya!</p>
          
          <div className="location-row">
            <div className="location-info">
              <h4 className="location-label">Lokasi Toko</h4>
              <p className="location-value">{toko.name}</p>
            </div>
            <button className="change-btn" onClick={() => navigate('/customer/shopping/map')}>
              Ganti lokasi
            </button>
          </div>

          <div className="location-row">
            <div className="location-info">
              <h4 className="location-label">Lokasi Pengantaran</h4>
              <p className="location-value">{pengantaran.name}</p>
            </div>
            <button className="change-btn" onClick={() => navigate('/customer/shopping/map')}>
              Ganti lokasi
            </button>
          </div>

          <div className="location-note-input">
            <Edit3 size={16} className="note-icon" />
            <input 
              type="text" 
              placeholder="Tambahin detail lokasi yuk!" 
              className="note-input"
            />
          </div>
        </div>

        {/* Order Details Input */}
        <div className="input-section">
          <h3 className="section-title">Masukkan Pesanan Anda</h3>
          <textarea 
            className="order-textarea" 
            placeholder="Masukkan Pesanan Anda"
            rows="3"
            value={pesanan}
            onChange={(e) => setPesanan(e.target.value)}
          ></textarea>
        </div>

        {/* Price Input */}
        <div className="input-section">
          <h3 className="section-title">Estimasi Harga</h3>
          <div className="price-input-wrapper">
            <span className="price-prefix">Rp</span>
            <div className="price-divider"></div>
            <input 
              type="text" 
              className="price-input" 
              placeholder="Estimasi Harga"
              value={estimasiHarga}
              onChange={(e) => setEstimasiHarga(e.target.value)}
            />
          </div>
        </div>
      </main>

      {/* Bottom Button */}
      <div className="bottom-action-container">
        <button 
          className="submit-btn" 
          onClick={() => {
            if (!pesanan || !estimasiHarga) {
              alert('Harap isi pesanan dan estimasi harga terlebih dahulu.');
              return;
            }
            navigate('/customer/shopping/checkout', {
              state: {
                toko,
                pengantaran,
                pesanan,
                estimasiHarga
              }
            });
          }}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
