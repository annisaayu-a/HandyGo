import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import './ProfileDetail.css';

export default function ProfileDetail() {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  
  // Disabled states based on initial login method
  const [isEmailDisabled, setIsEmailDisabled] = useState(false);
  const [isPhoneDisabled, setIsPhoneDisabled] = useState(false);
  
  // Phone validation
  const [phoneError, setPhoneError] = useState('');

  // Crop state
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('handyGoUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFullName(user.name || '');
      setPhoneNumber(user.phone || '');
      setEmail(user.email || '');
      setProfilePic(user.profile_picture || null);
      
      // Lock the fields that the user used to register/login
      if (user.email) setIsEmailDisabled(true);
      if (user.phone) setIsPhoneDisabled(true);
    }
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Set canvas size to match the bounding box
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/png');
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setShowBottomSheet(false);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleSaveCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Upload to server
      const userStr = localStorage.getItem('handyGoUser');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch('https://handygo-api.vercel.app/api/auth/profile/picture', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          imageBase64: croppedImageBase64
        })
      });

      const data = await response.json();
      if (response.ok) {
        user.profile_picture = data.user.profile_picture;
        localStorage.setItem('handyGoUser', JSON.stringify(user));
        setProfilePic(data.user.profile_picture);
        
        setIsError(false);
        setToastMessage('Foto Profil berhasil dipasang.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        setIsError(true);
        setToastMessage(data.error || 'Gagal mengunggah foto');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
      
    } catch (e) {
      console.error(e);
      setIsError(true);
      setToastMessage('Terjadi kesalahan saat memproses gambar');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
    setImageSrc(null); // Close crop view
  };

  const handleDeletePhoto = async () => {
    setShowBottomSheet(false);
    const userStr = localStorage.getItem('handyGoUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      const response = await fetch('https://handygo-api.vercel.app/api/auth/profile/picture', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (response.ok) {
        // Validate phone number before saving
        if (phoneNumber.startsWith('+62') && !phoneNumber.startsWith('+628')) {
          setIsError(true);
          setPhoneError('Nomor HP Indonesia harus dimulai dengan angka 8');
          setToastMessage('Format nomor HP tidak valid');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          return;
        }
        setPhoneError('');

        user.profile_picture = null;
        localStorage.setItem('handyGoUser', JSON.stringify(user));
        setProfilePic(null);
        
        setIsError(false);
        setToastMessage('Foto Profil berhasil dihapus.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    // Validation
    if (phoneNumber && phoneNumber.startsWith('+62') && !phoneNumber.startsWith('+628')) {
      setPhoneError('Nomor HP Indonesia harus dimulai dengan angka 8');
      setIsError(true);
      setToastMessage('Format nomor HP tidak valid');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    setPhoneError('');

    const userStr = localStorage.getItem('handyGoUser');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    
    try {
      const response = await fetch('https://handygo-api.vercel.app/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          full_name: fullName,
          phone_number: phoneNumber,
          email: email
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage
        user.name = fullName;
        user.phone = phoneNumber;
        user.email = email;
        localStorage.setItem('handyGoUser', JSON.stringify(user));
        
        // Lock fields after successful save if they were just filled
        if (email) setIsEmailDisabled(true);
        if (phoneNumber) setIsPhoneDisabled(true);
        
        setIsError(false);
        setToastMessage('Profil berhasil diperbarui');
        setShowToast(true);
        
        setTimeout(() => {
          setShowToast(false);
          navigate(-1);
        }, 2000);
      } else {
        setIsError(true);
        setToastMessage(data.error || 'Gagal menyimpan profil');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setToastMessage('Gagal menghubungi server');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="profile-detail-page animate-fade-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content" style={{ color: isError ? '#ef4444' : '#1e293b' }}>
            <div className="toast-icon-wrapper" style={{ backgroundColor: isError ? '#ef4444' : '#10b981' }}>
              <span className="toast-icon">{isError ? '!' : '✓'}</span>
            </div>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="profile-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="header-title">Detail Profil</h1>
      </header>

      <main className="profile-detail-content">
        {/* Profile Picture Section */}
        <div className="profile-pic-section">
          {profilePic ? (
            <img 
              src={`https://handygo-api.vercel.app${profilePic}`}
              alt="Profile" 
              className="profile-pic-large"
            />
          ) : (
            <img 
              src={`https://ui-avatars.com/api/?name=${fullName || 'Guest'}&background=cbd5e1&color=64748b&size=128`}
              alt="Profile" 
              className="profile-pic-large"
            />
          )}
          
          <a href="#" className="change-pic-link" onClick={(e) => {
            e.preventDefault();
            setShowBottomSheet(true);
          }}>
            Pasang/ganti foto profil
          </a>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Form Section */}
        <div className="profile-form">
          <div className="form-group-line">
            <label className="form-label-small">Nama</label>
            <input 
              type="text" 
              className="form-input-line" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama"
            />
          </div>

          <div className="form-group-line">
            <label className="form-label-small">Nomor HP</label>
            <div className="phone-input-wrapper" style={{ borderBottomColor: phoneError ? '#ef4444' : '' }}>
              <div className="phone-prefix">
                {phoneNumber.startsWith('+62') || !phoneNumber ? (
                  <img src="https://flagcdn.com/w20/id.png" alt="ID" className="flag-img" />
                ) : phoneNumber.startsWith('+60') ? (
                  <img src="https://flagcdn.com/w20/my.png" alt="MY" className="flag-img" />
                ) : phoneNumber.startsWith('+65') ? (
                  <img src="https://flagcdn.com/w20/sg.png" alt="SG" className="flag-img" />
                ) : (
                  <span className="flag-icon">🌐</span>
                )}
              </div>
              <input 
                type="tel" 
                className="form-input-line phone-input-field" 
                value={phoneNumber}
                disabled={isPhoneDisabled}
                onChange={(e) => {
                  let val = e.target.value;
                  // Auto format logic: if they just type numbers, assume +62
                  if (!val.startsWith('+')) {
                     val = '+' + val.replace(/\D/g, '');
                     // If it's just '+', reset
                     if (val === '+') val = '';
                     // Automatically prepend 62 if they just type 8...
                     else if (val.length === 2 && val.startsWith('+8')) val = '+628' + val.slice(2);
                  } else {
                     val = '+' + val.replace(/\D/g, '');
                  }
                  
                  setPhoneNumber(val);
                  if (val.startsWith('+62') && val.length > 3 && val[3] !== '8') {
                    setPhoneError('Nomor harus dimulai angka 8');
                  } else {
                    setPhoneError('');
                  }
                }}
              />
            </div>
            {phoneError && <span className="error-text-small" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{phoneError}</span>}
          </div>

          <div className="form-group-line">
            <label className="form-label-small">Email</label>
            <input 
              type="email" 
              className="form-input-line" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEmailDisabled}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="profile-detail-footer">
        <button className="submit-btn" onClick={handleSave} style={{ width: '100%' }}>
          Simpan
        </button>
      </footer>

      {/* Bottom Sheet Menu */}
      {showBottomSheet && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowBottomSheet(false)}></div>
          <div className="bottom-sheet-menu animate-slide-up">
            <h3 className="bottom-sheet-title">Foto profil</h3>
            <div className="bottom-sheet-item" onClick={() => fileInputRef.current.click()}>
              <ImageIcon size={20} color="#64748b" />
              <span>Pilih dari galeri</span>
            </div>
            <div className="bottom-sheet-item" onClick={handleDeletePhoto}>
              <Trash2 size={20} color="#ef4444" />
              <span style={{ color: '#ef4444' }}>Hapus foto</span>
            </div>
          </div>
        </>
      )}

      {/* Crop Screen Overlay */}
      {imageSrc && (
        <div className="crop-screen">
          <header className="crop-header">
            <button className="back-btn" onClick={() => setImageSrc(null)}>
              <ArrowLeft size={24} color="#fff" />
            </button>
            <h1 className="header-title" style={{ color: '#fff' }}>Atur Posisi Foto</h1>
          </header>
          <div className="crop-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <footer className="crop-footer">
            <button className="crop-cancel-btn" onClick={() => setImageSrc(null)}>Batal</button>
            <button className="crop-save-btn" onClick={handleSaveCrop}>Simpan</button>
          </footer>
        </div>
      )}
    </div>
  );
}
