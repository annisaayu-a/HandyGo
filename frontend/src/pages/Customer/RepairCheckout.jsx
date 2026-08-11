import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, ChevronRight, Zap, Monitor } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RepairCheckout.css';

export default function RepairCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [address, setAddress] = useState('');
  const [detailLokasi, setDetailLokasi] = useState('');
  
  useEffect(() => {
    if (location.state && location.state.selectedLocation) {
      setAddress(location.state.selectedLocation.address || location.state.selectedLocation.name);
    } else {
      const userStr = localStorage.getItem('handyGoUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.default_location) {
          setAddress(user.default_location);
        }
      }
    }
  }, [location.state]);

  const repairTypes = [
    {
      id: 'kelistrikan',
      title: 'Kelistrikan',
      description: 'Perbaikan instalasi listrik, saklar, stop kontak, lampu, MCB',
      icon: <Zap size={24} color="#f59e0b" fill="#f59e0b" />
    },
    {
      id: 'elektronik',
      title: 'Elektronik',
      description: 'TV, Mesin cuci, Kulkas, Dispenser, Kipas',
      icon: <Monitor size={24} color="#034078" />
    }
  ];

  return (
    <div className="cleaning-checkout-page animate-fade-in">
      {/* Header */}
      <header className="rc-header">
        <button className="rc-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="rc-title">Perbaikan</h1>
      </header>

      {/* Content */}
      <div className="rc-content">
        {/* Location Card */}
        <div className="rc-location-card">
          <div className="rc-location-header">
            <div>
              <h2 className="rc-location-title">Lokasi</h2>
              <p className="rc-location-address">{address || 'Memuat alamat...'}</p>
            </div>
            <button className="rc-ganti-lokasi" onClick={() => navigate('/customer/search-location', { state: { returnUrl: '/customer/repair/checkout' } })}>
              Ganti lokasi
            </button>
          </div>
          <div className="rc-detail-input-wrapper">
            <Edit3 size={16} className="rc-detail-icon" />
            <input 
              type="text" 
              className="rc-detail-input" 
              placeholder="Tambahin detail lokasi yuk!"
              value={detailLokasi}
              onChange={(e) => setDetailLokasi(e.target.value)}
            />
          </div>
        </div>

        {/* Info Text */}
        <div className="rc-info-text-container">
          <div className="rc-info-text-top">
            <span style={{ color: '#334155', fontWeight: 500 }}>Layanan ini akan menghitung total harga<br/>berdasarkan hasil pengecekan kondisi<br/>kerusakan oleh tim kami.</span>
            <ChevronRight size={16} color="#cbd5e1" style={{ marginTop: '2px' }} />
          </div>
          <div className="rc-info-text-bottom">
            Lihat syarat dan ketentuannya di sini.
          </div>
        </div>

        {/* Repair Types */}
        <div className="rc-section">
          <h2 className="rc-section-title" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
            Pilih jenis perbaikan yang kamu butuhkan
          </h2>
          
          <div className="rc-types-list">
            {repairTypes.map((type) => (
              <div 
                key={type.id} 
                className="rc-type-card"
                onClick={() => {
                  navigate('/customer/repair/details', { 
                    state: { 
                      repairTypeTitle: type.title,
                      selectedLocation: location.state?.selectedLocation,
                      detailLokasi: detailLokasi
                    } 
                  });
                }}
              >
                <div className="rc-icon-wrapper">
                  {type.icon}
                </div>
                <div className="rc-type-content">
                  <h3 className="rc-type-title">{type.title}</h3>
                  <p className="rc-type-desc">{type.description}</p>
                </div>
                <ChevronRight size={20} color="#cbd5e1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
