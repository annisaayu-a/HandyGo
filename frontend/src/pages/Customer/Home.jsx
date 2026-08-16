import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MapPin, Percent } from 'lucide-react';
import { FaShoppingBasket, FaBox, FaBroom, FaWrench, FaTruck, FaMotorcycle } from 'react-icons/fa';
import './Home.css';

export default function CustomerHome() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
  const userName = storedUser.name || 'Ajel';
  const profilePic = storedUser.profile_picture;
  const userLocation = storedUser.default_location || 'Atur lokasimu di sini';
  
  const displayLocation = userLocation === 'Atur lokasimu di sini' ? userLocation : userLocation.split(',')[0];

  const services = [
    { id: 1, name: 'Belanja', icon: <FaShoppingBasket size={26} color="#e11d48" />, bg: '#fff1f2' },
    { id: 2, name: 'Antar Barang', icon: <FaBox size={26} color="#16a34a" />, bg: '#f0fdf4' },
    { id: 3, name: 'Bersih-Bersih', icon: <FaBroom size={26} color="#3b82f6" />, bg: '#eff6ff' },
    { id: 4, name: 'Perbaikan', icon: <FaWrench size={26} color="#ea580c" />, bg: '#fff7ed' },
    { id: 5, name: 'Pindahan', icon: <FaTruck size={26} color="#6366f1" />, bg: '#eef2ff' },
    { id: 6, name: 'Antar Jemput', icon: <FaMotorcycle size={26} color="#0284c7" />, bg: '#f0f9ff' }
  ];

  return (
    <div className="customer-home animate-fade-in">
      {/* Header Section */}
      <header className="home-header">
        <div className="profile-section">
          {profilePic ? (
            <img 
              src={profilePic.startsWith('data:image') ? profilePic : `https://handygo-api.vercel.app${profilePic}`}
              alt="Profile" 
              className="profile-img"
            />
          ) : (
            <img 
              src={`https://ui-avatars.com/api/?name=${userName}&background=f1f5f9&color=0f172a`} 
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
        <button className="notification-btn" onClick={() => navigate('/customer/notifications')}>
          <Bell size={22} color="#0f172a" />
        </button>
      </header>

      {/* Greeting Section */}
      <section className="greeting-section">
        <h1 className="greeting-title">Selamat Datang!</h1>
        <h2 className="greeting-subtitle">Mau dibantu apa hari ini?</h2>
      </section>

      {/* Search Bar */}
      <section className="search-section" onClick={() => navigate('/customer/search')} style={{ cursor: 'pointer' }}>
        <div className="search-bar" style={{ pointerEvents: 'none' }}>
          <Search size={20} className="search-icon" color="#94a3b8" />
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
                if (service.id === 1) navigate('/customer/shopping');
                else if (service.id === 2) navigate('/customer/delivery');
                else if (service.id === 3) navigate('/customer/cleaning');
                else if (service.id === 4) navigate('/customer/repair');
                else if (service.id === 5) navigate('/customer/transport'); // Using transport for pindahan
                else if (service.id === 6) navigate('/customer/transport');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="service-icon-wrapper" style={{ backgroundColor: service.bg }}>
                {service.icon}
              </div>
              <span className="service-name">{service.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Section */}
      <section className="promo-section">
        <h3 className="section-title">Promo Untukmu</h3>
        <div className="promo-card-main">
          <div className="promo-content">
            <span className="promo-text">Ongkir untuk semua layanan</span>
            <h2 className="promo-big">100% GRATIS</h2>
          </div>
          <div className="promo-bg-shape"></div>
          <div className="promo-icon-wrapper">
            <Percent size={42} color="#5b69c4" strokeWidth={4} />
          </div>
        </div>
      </section>
    </div>
  );
}
