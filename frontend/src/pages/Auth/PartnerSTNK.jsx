import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Image as ImageIcon, Camera, ChevronRight, Info } from 'lucide-react';
import './PartnerSTNK.css';

export default function PartnerSTNK() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOptions, setShowOptions] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [formData, setFormData] = useState({
    platNomor: '',
    namaPemilik: '',
    kendaraan: '',
    tahun: '',
    warna: '',
    nomorRangka: '',
    nomorMesin: '',
    masaBerlaku: ''
  });

  const handleUploadClick = () => {
    setShowOptions(true);
  };

  const closeOptions = () => {
    setShowOptions(false);
  };

  const handleFileSelected = (file) => {
    setUploadError(null);
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Format file tidak sesuai. Gunakan format .jpg, .jpeg, atau .png');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file melebihi batas 10MB. Mohon pilih file yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimension
        const MAX_SIZE = 1200;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to 80% JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setUploadedImageUrl(compressedDataUrl);
        setIsUploaded(true);
        
        try {
          localStorage.setItem('handyGoStnkPhoto', compressedDataUrl);
        } catch (err) {
          console.error("Failed to save to localStorage:", err);
          setUploadError("Gagal menyimpan foto karena memori browser penuh.");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleOptionSelect = (type) => {
    closeOptions();
    if (type === 'gallery') {
      // Trigger real file picker (gallery)
      fileInputRef.current?.click();
    } else if (type === 'camera') {
      // Trigger real camera capture
      cameraInputRef.current?.click();
    }
  };

  const handleSave = () => {
    navigate('/partner-upload', {
      state: {
        ...location.state,
        stnkVerified: true
      }
    });
  };

  const isFormValid = isUploaded && Object.values(formData).every(val => val.trim() !== '');

  return (
    <div className="partner-stnk-container animate-fade-in">
      {/* Hidden real file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />

      <div className="stnk-header">
        <button className="stnk-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="stnk-title">STNK</h1>
      </div>

      <div className="stnk-content">
        <h2 className="stnk-section-title">Unggah Foto STNK dan Isi Formulir</h2>

        {uploadError && (
          <div className="stnk-warning-box animate-fade-in">
            <div className="stnk-warning-icon">
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>!</span>
            </div>
            <p className="stnk-warning-text">{uploadError}</p>
          </div>
        )}

        {isUploaded ? (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <img
              src={uploadedImageUrl}
              alt="STNK yang diunggah"
              style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px', border: '2px solid #0ea5e9', marginBottom: '0.75rem' }}
            />
            <button className="stnk-ganti-foto-btn" onClick={handleUploadClick}>
              Ganti Foto
            </button>
          </div>
        ) : (
          <div className="stnk-upload-box" onClick={handleUploadClick}>
            <div className="stnk-upload-icon-wrapper">
              <Plus size={20} color="#ffffff" strokeWidth={3} />
            </div>
            <p className="stnk-upload-desc">
              Ukuran file tidak boleh lebih dari 10MB<br />
              dengan format .jpg .jpeg .png
            </p>
          </div>
        )}

        <div className="stnk-info-box">
          <div className="stnk-info-icon">
            <Info size={16} color="#ffffff" />
          </div>
          <p className="stnk-info-text">
            {isUploaded
              ? 'Foto STNK berhasil diunggah. Silakan isi data kendaraan di bawah ini.'
              : 'Pastikan STNK terlihat jelas dari depan, tidak buram, dan dengan pencahayaan yang cukup.'}
          </p>
        </div>

        {/* Form Fields - only visible after upload, editable since no OCR */}
        {isUploaded && (
          <div className="stnk-form animate-fade-in">
            <div className="stnk-input-group">
              <label>Nomor Polisi Kendaraan</label>
              <input
                type="text"
                placeholder="Contoh: DD 1234 AB"
                value={formData.platNomor}
                onChange={(e) => setFormData({ ...formData, platNomor: e.target.value })}
              />
            </div>
            <div className="stnk-input-group">
              <label>Pemilik</label>
              <input
                type="text"
                placeholder="Nama sesuai STNK"
                value={formData.namaPemilik}
                onChange={(e) => setFormData({ ...formData, namaPemilik: e.target.value })}
              />
            </div>
            <div className="stnk-form-row">
              <div className="stnk-input-group">
                <label>Kendaraan</label>
                <input
                  type="text"
                  placeholder="Merk & tipe"
                  value={formData.kendaraan}
                  onChange={(e) => setFormData({ ...formData, kendaraan: e.target.value })}
                />
              </div>
              <div className="stnk-input-group">
                <label>Tahun</label>
                <input
                  type="text"
                  placeholder="Tahun"
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                />
              </div>
            </div>
            <div className="stnk-input-group">
              <label>Warna</label>
              <input
                type="text"
                placeholder="Warna kendaraan"
                value={formData.warna}
                onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
              />
            </div>
            <div className="stnk-input-group">
              <label>Nomor Rangka</label>
              <input
                type="text"
                placeholder="Nomor rangka sesuai STNK"
                value={formData.nomorRangka}
                onChange={(e) => setFormData({ ...formData, nomorRangka: e.target.value })}
              />
            </div>
            <div className="stnk-input-group">
              <label>Nomor Mesin</label>
              <input
                type="text"
                placeholder="Nomor mesin sesuai STNK"
                value={formData.nomorMesin}
                onChange={(e) => setFormData({ ...formData, nomorMesin: e.target.value })}
              />
            </div>
            <div className="stnk-input-group">
              <label>Masa Berlaku STNK</label>
              <input
                type="text"
                placeholder="Contoh: 18 Agustus 2028"
                value={formData.masaBerlaku}
                onChange={(e) => setFormData({ ...formData, masaBerlaku: e.target.value })}
              />
            </div>
          </div>
        )}

        <button
          className={`stnk-save-btn ${isFormValid ? 'active' : ''}`}
          disabled={!isFormValid}
          onClick={handleSave}
        >
          {isUploaded ? 'Konfirmasi' : 'Simpan Data'}
        </button>
      </div>

      {/* Bottom Sheet Overlay */}
      {showOptions && (
        <>
          <div className="stnk-overlay" onClick={closeOptions}></div>
          <div className="stnk-bottom-sheet animate-slide-up-sheet">
            <h3 className="stnk-sheet-title">Unggah Foto STNK</h3>

            <div className="stnk-sheet-options">
              <button className="stnk-sheet-btn" onClick={() => handleOptionSelect('gallery')}>
                <div className="stnk-sheet-btn-left">
                  <ImageIcon size={24} color="#64748b" />
                  <span>Pilih dari galeri</span>
                </div>
                <ChevronRight size={20} color="#94a3b8" />
              </button>

              <button className="stnk-sheet-btn" onClick={() => handleOptionSelect('camera')}>
                <div className="stnk-sheet-btn-left">
                  <Camera size={24} color="#64748b" />
                  <span>Ambil foto</span>
                </div>
                <ChevronRight size={20} color="#94a3b8" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
