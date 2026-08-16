import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Image, User } from 'lucide-react';
import './ProfileDetail.css';

export default function MitraProfileDetail() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '',
    jenisMitra: 'Mitra Motor',
    phone: '',
    email: '',
    avatar: null,
  });
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [captureMode, setCaptureMode] = useState(null); // 'camera' | 'gallery' | null

  useEffect(() => {
    const savedData = localStorage.getItem('mitra_profile_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileData(prev => ({
          ...prev,
          ...parsed,
          // Strip +62 prefix from phone for the display field
        }));
      } catch (e) {
        console.error('Error parsing profile data', e);
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Persist changes
    localStorage.setItem('mitra_profile_data', JSON.stringify(profileData));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate('/mitra/profile');
      }, 800);
    }, 600);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setProfileData(prev => ({ ...prev, avatar: base64 }));
      localStorage.setItem('mitra_profile_data', JSON.stringify({ ...profileData, avatar: base64 }));
    };
    reader.readAsDataURL(file);
    setShowPhotoSheet(false);
    setCaptureMode(null);
  };

  const triggerCamera = () => {
    setCaptureMode('camera');
    setShowPhotoSheet(false);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      }
    }, 100);
  };

  const triggerGallery = () => {
    setCaptureMode('gallery');
    setShowPhotoSheet(false);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
      }
    }, 100);
  };

  return (
    <div className="mpdetail-container animate-fade-in">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="mpdetail-header">
        <button className="mpdetail-back-btn" onClick={() => navigate('/mitra/profile')}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <h1 className="mpdetail-title">Detail Profil</h1>
      </div>

      {/* Avatar */}
      <div className="mpdetail-avatar-section">
        <div className="mpdetail-avatar" onClick={() => setShowPhotoSheet(true)}>
          {profileData.avatar ? (
            <img src={profileData.avatar} alt="Profile" />
          ) : (
            <User size={48} color="#ffffff" />
          )}
        </div>
        <button className="mpdetail-photo-link" onClick={() => setShowPhotoSheet(true)}>
          Pasang/ganti foto profil
        </button>
      </div>

      {/* Editable Fields */}
      <div className="mpdetail-form">
        <div className="mpdetail-field">
          <label className="mpdetail-label">Nama</label>
          <input
            className="mpdetail-input"
            type="text"
            value={profileData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nama lengkap"
          />
          <div className="mpdetail-divider" />
        </div>

        <div className="mpdetail-field">
          <label className="mpdetail-label">Jenis Mitra</label>
          <select
            className="mpdetail-input mpdetail-select"
            value={profileData.jenisMitra || 'Mitra Motor'}
            onChange={(e) => handleChange('jenisMitra', e.target.value)}
          >
            <option value="Mitra Motor">Mitra Motor</option>
            <option value="Mitra Mobil">Mitra Mobil</option>
          </select>
          <div className="mpdetail-divider" />
        </div>

        <div className="mpdetail-field">
          <label className="mpdetail-label">Nomor HP</label>
          <div className="mpdetail-phone-row">
            <div className="mpdetail-flag-prefix">
              <img src="https://flagcdn.com/w20/id.png" alt="ID" className="mpdetail-flag" />
              <span className="mpdetail-prefix-text">+62</span>
            </div>
            <input
              className="mpdetail-input mpdetail-phone-input"
              type="tel"
              value={(profileData.phone || '').replace(/^\+62/, '')}
              onChange={(e) => handleChange('phone', '+62' + e.target.value.replace(/^\+62/, '').replace(/\D/g, ''))}
              placeholder="8123456789"
            />
          </div>
          <div className="mpdetail-divider" />
        </div>

        <div className="mpdetail-field">
          <label className="mpdetail-label">Email</label>
          <input
            className="mpdetail-input"
            type="email"
            value={profileData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contoh@gmail.com"
          />
          <div className="mpdetail-divider" />
        </div>
      </div>

      {/* Save Button */}
      <div className="mpdetail-bottom">
        <button
          className={`mpdetail-save-btn ${saveSuccess ? 'success' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan ✓' : 'Simpan'}
        </button>
      </div>

      {/* Photo Bottom Sheet */}
      {showPhotoSheet && (
        <>
          <div className="mpdetail-overlay" onClick={() => setShowPhotoSheet(false)} />
          <div className="mpdetail-sheet animate-slide-up">
            <div className="mpdetail-sheet-handle" />
            <h3 className="mpdetail-sheet-title">Foto Profil</h3>
            <div className="mpdetail-sheet-options">
              <button className="mpdetail-sheet-btn" onClick={triggerCamera}>
                <div className="mpdetail-sheet-icon">
                  <Camera size={22} color="#034078" />
                </div>
                <span>Ambil Gambar</span>
              </button>
              <button className="mpdetail-sheet-btn" onClick={triggerGallery}>
                <div className="mpdetail-sheet-icon">
                  <Image size={22} color="#034078" />
                </div>
                <span>Pilih dari Galeri</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
