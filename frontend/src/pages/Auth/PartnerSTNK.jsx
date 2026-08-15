import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Image as ImageIcon, Camera, ChevronRight, Info } from 'lucide-react';
import './PartnerSTNK.css';

export default function PartnerSTNK() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOptions, setShowOptions] = useState(false);
  const [errorBuram, setErrorBuram] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [cameraAttempts, setCameraAttempts] = useState(0);

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

  const simulateSuccess = () => {
    setIsUploaded(true);
    setFormData({
      platNomor: 'DD 4827 QZ',
      namaPemilik: 'Joko Prasetyo',
      kendaraan: 'Honda Vario 160',
      tahun: '2023',
      warna: 'Hitam',
      nomorRangka: 'MH1KF1123PK482731',
      nomorMesin: 'KF11E2482731',
      masaBerlaku: '18 Agustus 2028'
    });
  };

  const handleOptionSelect = (type) => {
    closeOptions();
    if (type === 'gallery') {
      const isValid = window.confirm("Simulasi: Pilih OK untuk simulasi file valid, Cancel untuk file invalid (otomatis ditolak).");
      if (isValid) {
        setErrorBuram(false);
        simulateSuccess();
      } else {
        alert("File ditolak: Ukuran melebihi 10MB atau format tidak sesuai.");
      }
    } else if (type === 'camera') {
      if (cameraAttempts === 0) {
        setErrorBuram(true);
        setCameraAttempts(1);
      } else {
        setErrorBuram(false);
        simulateSuccess();
      }
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

  return (
    <div className="partner-stnk-container animate-fade-in">
      <div className="stnk-header">
        <button className="stnk-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="stnk-title">STNK</h1>
      </div>

      <div className="stnk-content">
        <h2 className="stnk-section-title">Unggah Foto STNK dan Isi Formulir</h2>
        
        {errorBuram && (
          <div className="stnk-warning-box animate-fade-in">
            <div className="stnk-warning-icon">
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>i</span>
            </div>
            <p className="stnk-warning-text">
              Gambar yang kamu ambil masih buram nih, coba lagi yuk
            </p>
          </div>
        )}

        {isUploaded ? (
          <button className="stnk-ganti-foto-btn animate-fade-in" onClick={handleUploadClick}>
            Ganti Foto
          </button>
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
              ? "Pastikan data di bawah ini sudah sesuai dengan STNK yang kamu masukkan" 
              : "Pastikan STNK terlihat jelas dari depan, tidak buram, dan dengan pencahayaan yang cukup."}
          </p>
        </div>

        {/* Form Fields only show when uploaded */}
        {isUploaded && (
          <div className="stnk-form animate-fade-in">
            <div className="stnk-input-group">
              <label>Nomor Polisi Kendaraan</label>
              <input type="text" value={formData.platNomor} readOnly />
            </div>
            <div className="stnk-input-group">
              <label>Pemilik</label>
              <input type="text" value={formData.namaPemilik} readOnly />
            </div>
            <div className="stnk-form-row">
              <div className="stnk-input-group">
                <label>Kendaraan</label>
                <input type="text" value={formData.kendaraan} readOnly />
              </div>
              <div className="stnk-input-group">
                <label>Tahun</label>
                <input type="text" value={formData.tahun} readOnly />
              </div>
            </div>
            <div className="stnk-input-group">
              <label>Warna</label>
              <input type="text" value={formData.warna} readOnly />
            </div>
            <div className="stnk-input-group">
              <label>Nomor Rangka</label>
              <input type="text" value={formData.nomorRangka} readOnly />
            </div>
            <div className="stnk-input-group">
              <label>Nomor Mesin</label>
              <input type="text" value={formData.nomorMesin} readOnly />
            </div>
            <div className="stnk-input-group">
              <label>Masa Berlaku STNK</label>
              <input type="text" value={formData.masaBerlaku} readOnly />
            </div>
          </div>
        )}

        <button 
          className={`stnk-save-btn ${isUploaded ? 'active' : ''}`} 
          disabled={!isUploaded}
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
            <h3 className="stnk-sheet-title">Unggah Foto</h3>
            
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
