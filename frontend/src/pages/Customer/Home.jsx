import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MapPin } from 'lucide-react';
import { FaShoppingBag, FaBox, FaBroom, FaWrench, FaTruck, FaMotorcycle } from 'react-icons/fa';
import './Home.css';

export default function CustomerHome() {
  const navigate = useNavigate();

  
  const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
  const userName = storedUser.name || 'Ajel';
  const profilePic = storedUser.profile_picture;
  const userLocation = storedUser.default_location || 'Atur lokasimu di sini';
  
  // Format location to be shorter for Home screen if it's too long
  const displayLocation = userLocation === 'Atur lokasimu di sini' ? userLocation : userLocation.split(',')[0];

  const iconProps = { size: 28, color: "#034078" };

  const services = [
    { id: 1, name: 'Belanja', icon: <FaShoppingBag {...iconProps} /> },
    { id: 2, name: 'Antar Barang', icon: <FaBox {...iconProps} /> },
    { id: 3, name: 'Bersih-Bersih', icon: <FaBroom {...iconProps} /> },
    { id: 4, name: 'Perbaikan', icon: <FaWrench {...iconProps} /> },
    { id: 5, name: 'Pindahan', icon: <FaTruck {...iconProps} /> },
    { id: 6, name: 'Antar Jemput', icon: <FaMotorcycle {...iconProps} /> }
  ];

  return (
    <div className="customer-home animate-fade-in">
      {/* Header Section */}
      <header className="home-header">
        <div className="profile-section">
          {profilePic ? (
            <img 
              src={`http://localhost:5000${profilePic}`}
              alt="Profile" 
              className="profile-img"
            />
          ) : (
            <img 
              src={`https://ui-avatars.com/api/?name=${userName}&background=034078&color=fff`} 
              alt="Profile" 
              className="profile-img"
            />
          )}
          <div className="profile-info">
            <h2 className="profile-name">{userName}</h2>
            <p 
              className="profile-location" 
              onClick={() => navigate('/customer/location')}
              style={{ cursor: 'pointer' }}
            >
              <MapPin size={12} className="location-icon" /> 
              {displayLocation}
            </p>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={20} />
        </button>
      </header>

      {/* Greeting Section */}
      <section className="greeting-section">
        <h1 className="greeting-title">Hai, {userName}!</h1>
        <h2 className="greeting-subtitle">Mau dibantu apa hari ini?</h2>
      </section>

      {/* Search Bar */}
      <section className="search-section" onClick={() => navigate('/customer/search')} style={{ cursor: 'pointer' }}>
        <div className="search-bar" style={{ pointerEvents: 'none' }}>
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari kebutuhanmu di sini"
            className="search-input"
            readOnly
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
                } else if (service.id === 2) {
                  navigate('/customer/delivery');
                } else if (service.id === 3) {
                  navigate('/customer/cleaning');
                } else if (service.id === 4) {
                  navigate('/customer/repair');
                } else if (service.id === 6) {
                  navigate('/customer/transport');
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
