import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MapPin, ShoppingBag, Package, Sparkles, Wrench, Truck, Bike, Book } from 'lucide-react';
import './Home.css';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    { id: 1, name: 'Belanja', icon: <ShoppingBag size={24} /> },
    { id: 2, name: 'Antar Barang', icon: <Package size={24} /> },
    { id: 3, name: 'Bersih-Bersih', icon: <Sparkles size={24} /> },
    { id: 4, name: 'Perbaikan', icon: <Wrench size={24} /> },
    { id: 5, name: 'Pindahan', icon: <Truck size={24} /> },
    { id: 6, name: 'Antar Jemput', icon: <Bike size={24} /> },
    { id: 7, name: 'Tugas', icon: <Book size={24} /> },
  ];

  return (
    <div className="customer-home animate-fade-in">
      {/* Header Section */}
      <header className="home-header">
        <div className="profile-section">
          <img 
            src="https://ui-avatars.com/api/?name=Ajel&background=034078&color=fff" 
            alt="Profile" 
            className="profile-img"
          />
          <div className="profile-info">
            <h2 className="profile-name">Ajel</h2>
            <p className="profile-location">
              <MapPin size={12} className="location-icon" /> Kab. Gowa
            </p>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={20} />
        </button>
      </header>

      {/* Greeting Section */}
      <section className="greeting-section">
        <h1 className="greeting-title">Hai, Ajel!</h1>
        <h2 className="greeting-subtitle">Mau dibantu apa hari ini?</h2>
      </section>

      {/* Search Bar */}
      <section className="search-section">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari kebutuhanmu di sini"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <h3 className="section-title">Layanan kami</h3>
        <div className="services-grid">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="service-item"
              onClick={() => {
                if (service.id === 1) {
                  navigate('/customer/shopping');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="service-icon-wrapper">
                {service.icon}
              </div>
              <span className="service-name">{service.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Section */}
      <section className="promo-section">
        <div className="promo-header">
          <h3 className="section-title">Promo Untukmu</h3>
          <a href="#" className="see-all-link">Lihat Semua</a>
        </div>
        
        <div className="promo-scroll">
          <div className="promo-card">
            <div className="promo-left">
              <span className="promo-value">20%</span>
              <span className="promo-type">diskon</span>
            </div>
            <div className="promo-right">
              <h4 className="promo-title">Layanan Kebersihan</h4>
              <p className="promo-expiry">Berakhir besok 23:59</p>
            </div>
          </div>
          
          <div className="promo-card">
            <div className="promo-left">
              <span className="promo-value">FREE</span>
              <span className="promo-type">ongkir</span>
            </div>
            <div className="promo-right">
              <h4 className="promo-title">Seluruh Layanan</h4>
              <p className="promo-expiry">Berakhir hari ini 23:59</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
