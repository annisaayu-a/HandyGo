import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Info, ShieldCheck } from 'lucide-react';
import './Profile.css';

export default function MitraProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: 'Mitra HandyGo',
    phone: '-',
    avatar: null
  });

  useEffect(() => {
    const savedData = localStorage.getItem('mitra_profile_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileData(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
          jenisMitra: parsed.jenisMitra || prev.jenisMitra,
          avatar: parsed.avatar || null,
        }));
      } catch (e) {
        console.error('Error parsing profile data', e);
      }
    }
  }, []);

  return (
    <div className="mprofile-container animate-fade-in">
      <div className="mprofile-header">
        <button className="mprofile-back-btn" onClick={() => navigate('/mitra')}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <h1 className="mprofile-title">Profil</h1>
      </div>

      <div className="mprofile-content">
        {/* User Info Row */}
        <div className="mprofile-user-info">
          <div className="mprofile-avatar">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Profile" />
            ) : (
              <User size={40} color="#ffffff" />
            )}
          </div>
          <div className="mprofile-details">
            <h2 className="mprofile-name">{profileData.name}</h2>
            <p className="mprofile-phone">{profileData.phone || '-'}</p>
          </div>
        </div>

        {/* Menu List */}
        <div className="mprofile-menu-list">
          <div
            className="mprofile-menu-item"
            onClick={() => navigate('/mitra/profile/detail')}
          >
            <div className="mprofile-menu-icon">
              <User size={14} color="#64748b" />
            </div>
            <span className="mprofile-menu-text">Detail Profil</span>
          </div>

          <div
            className="mprofile-menu-item"
            onClick={() => navigate('/mitra/app-info')}
          >
            <div className="mprofile-menu-icon">
              <Info size={14} color="#64748b" />
            </div>
            <span className="mprofile-menu-text">Informasi Aplikasi</span>
          </div>

          <div className="mprofile-menu-item" onClick={() => navigate('/mitra/protection')}>
            <div className="mprofile-menu-icon">
              <ShieldCheck size={14} color="#64748b" />
            </div>
            <span className="mprofile-menu-text">Perlindungan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
