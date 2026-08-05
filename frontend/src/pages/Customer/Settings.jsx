import { useNavigate } from 'react-router-dom';
import { User, MapPin, CreditCard, Info, ShieldCheck } from 'lucide-react';
import './Settings.css';

export default function CustomerSettings() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
  const userName = storedUser.name || 'Ajel';
  const userPhone = storedUser.phone;
  const profilePic = storedUser.profile_picture;

  const menuItems = [
    { id: 1, label: 'Detail Profil', icon: <User size={20} /> },
    { id: 2, label: 'Lokasi', icon: <MapPin size={20} /> },
    { id: 3, label: 'Pembayaran', icon: <CreditCard size={20} /> },
    { id: 4, label: 'Informasi Aplikasi', icon: <Info size={20} /> },
    { id: 5, label: 'Perlindungan', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="customer-settings animate-fade-in">
      {/* Settings Header */}
      <div className="settings-header-large">
        {profilePic ? (
          <img 
            src={`http://localhost:5000${profilePic}`}
            alt="Profile" 
            className="settings-img-large"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <img 
            src={`https://ui-avatars.com/api/?name=${userName}&background=034078&color=fff&size=128`}
            alt="Profile" 
            className="settings-img-large"
          />
        )}
        <div className="settings-info-large">
          <h1 className="settings-name-large">{userName}</h1>
          {userPhone ? (
            <p className="settings-phone">{userPhone}</p>
          ) : (
            <p 
              className="settings-phone-missing" 
              onClick={() => navigate('/customer/profile')}
              style={{ color: '#034078', cursor: 'pointer', fontSize: '0.85rem', marginTop: '4px' }}
            >
              Atur nomor HP kamu
            </p>
          )}
        </div>
      </div>

      {/* Menu List */}
      <div className="settings-menu-list">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className="settings-menu-item"
            onClick={() => {
              if (item.label === 'Detail Profil') navigate('/customer/profile');
              if (item.label === 'Lokasi') navigate('/customer/location');
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="menu-icon">
              {item.icon}
            </div>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
