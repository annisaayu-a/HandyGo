import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Image as ImageIcon, Camera, ChevronRight, Info } from 'lucide-react';
import './PartnerSTNK.css';

export default function PartnerSTNK() {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const handleUploadClick = () => {
    setShowOptions(true);
  };

  const closeOptions = () => {
    setShowOptions(false);
  };

  const handleOptionSelect = (type) => {
    // Simulasi aksi pilih dari galeri atau kamera
    alert(`Simulasi: Membuka ${type === 'gallery' ? 'Galeri' : 'Kamera'}...`);
    closeOptions();
    // Setelah simulasi berhasil (misalnya setelah milih file), bisa langsung redirect
    // navigate('/partner-upload', { state: { stnkVerified: true } });
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
        
        <div className="stnk-upload-box" onClick={handleUploadClick}>
          <div className="stnk-upload-icon-wrapper">
            <Plus size={20} color="#ffffff" strokeWidth={3} />
          </div>
          <p className="stnk-upload-desc">
            Ukuran file tidak boleh lebih dari 10MB<br />
            dengan format .jpg .jpeg .png
          </p>
        </div>

        <div className="stnk-info-box">
          <div className="stnk-info-icon">
            <Info size={16} color="#ffffff" />
          </div>
          <p className="stnk-info-text">
            Pastikan STNK terlihat jelas dari depan, tidak buram, dan dengan pencahayaan yang cukup.
          </p>
        </div>
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
