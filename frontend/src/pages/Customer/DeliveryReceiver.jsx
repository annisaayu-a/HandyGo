import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, FileText, Coffee, Shirt, Pill, BookOpen, Gift, MoreHorizontal } from 'lucide-react';
import './DeliveryReceiver.css';

export default function DeliveryReceiver() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get locations from state, or fallback to mock data
  const pickup = location.state?.pickup || { name: 'Universitas Hasanuddin Fak...', address: 'Jl. Perintis Kemerdekaan' };
  const dropoff = location.state?.dropoff || { name: 'Pondok Nabil', address: 'Jl. Sahabat' };

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const detailLocation = sessionStorage.getItem('deliveryDetailLocation') || '';

  const categories = [
    { id: 'dokumen', label: 'Dokumen', icon: <FileText size={16} /> },
    { id: 'makanan', label: 'Makanan', icon: <Coffee size={16} /> },
    { id: 'pakaian', label: 'Pakaian', icon: <Shirt size={16} /> },
    { id: 'obat', label: 'Obat-obatan', icon: <Pill size={16} /> },
    { id: 'buku', label: 'Buku', icon: <BookOpen size={16} /> },
    { id: 'parcel', label: 'Parcel/Hadiah', icon: <Gift size={16} /> },
    { id: 'lainnya', label: 'Lainnya', icon: <MoreHorizontal size={16} /> }
  ];

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('0')) value = value.substring(1);
    if (value.startsWith('62')) value = value.substring(2);
    setReceiverPhone(value);
  };

  const isFormValid = receiverName.trim() !== '' && receiverPhone.length >= 9 && selectedCategory;

  const handleNext = () => {
    if (!isFormValid) return;
    
    // Navigate to checkout step directly
    navigate('/customer/delivery/checkout', { 
      state: { 
        ...location.state, 
        receiverName, 
        receiverPhone, 
        selectedCategory 
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
              value={detailLocation}
              readOnly
            />
          </div>
        </div>

        {/* Receiver Details */}
        <section className="receiver-section">
          <h2 className="section-title">Detail Penerima</h2>
          
          <div className="input-group">
            <input 
              type="text" 
              className="receiver-input"
              placeholder="Masukkan nama penerima"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
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
              value={receiverPhone}
              onChange={handlePhoneChange}
            />
          </div>
        </section>

        {/* Categories */}
        <section className="category-section">
          <h2 className="section-title">Kategori Barang</h2>
          
          <div className="category-grid">
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`category-pill ${selectedCategory === cat.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            ))}
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
