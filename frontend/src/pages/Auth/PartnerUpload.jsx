import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import './PartnerUpload.css';

export default function PartnerUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deadlineDate, setDeadlineDate] = useState('');
  
  const ktpVerified = location.state?.ktpVerified || false;
  const simVerified = location.state?.simVerified || false;
  const vehicle = location.state?.vehicle || 'motor';

  // Get actual captured photos from localStorage
  const ktpPhoto = localStorage.getItem('handyGoKtpPhoto');
  const simPhoto = localStorage.getItem('handyGoSimPhoto');
  const stnkPhoto = localStorage.getItem('handyGoStnkPhoto');

  useEffect(() => {
    const regDateStr = localStorage.getItem('partnerRegistrationDate');
    const baseDate = regDateStr ? new Date(regDateStr) : new Date();
    baseDate.setDate(baseDate.getDate() + 3);
    const formattedDate = baseDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setDeadlineDate(formattedDate);
  }, []);

  const stnkVerified = location.state?.stnkVerified || false;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const documents = [
    { 
      id: 'ktp', 
      title: 'KTP', 
      status: ktpVerified ? 'Sudah diunggah' : 'Belum diunggah',
      verified: ktpVerified,
      photo: ktpPhoto
    },
    { 
      id: 'sim', 
      title: 'SIM', 
      status: simVerified ? 'Sudah diunggah' : 'Belum diunggah', 
      verified: simVerified,
      photo: simPhoto
    },
    { 
      id: 'stnk', 
      title: 'STNK', 
      status: stnkVerified ? 'Sudah diunggah' : 'Belum diunggah', 
      verified: stnkVerified,
      photo: stnkPhoto
    }
  ];

  const handleDocClick = (id) => {
    if (id === 'ktp' || id === 'sim') {
      navigate('/partner-camera', { state: { docType: id, vehicle, ktpVerified, simVerified, stnkVerified } });
    } else if (id === 'stnk') {
      navigate('/partner-stnk', { state: { vehicle, ktpVerified, simVerified, stnkVerified } });
    } else {
      alert(`Simulasi: Fitur upload untuk ${id.toUpperCase()} belum tersedia`);
    }
  };

  const handleDaftarClick = () => {
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmDaftar = () => {
    localStorage.setItem('partnerRegistrationComplete', 'true');
    setShowConfirmModal(false);
    navigate('/partner-success');
  };

  return (
    <div className="partner-upload-container animate-fade-in">
      <div className="pu-header">
        <button className="pu-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="pu-title">Pendaftaran Mitra HandyGo</h1>
      </div>

      <div className="pu-content">
        <p className="pu-subtitle">Satu langkah lagi dan kamu resmi menjadi mitra HandyGo!</p>
        
        <h2 className="pu-section-title">Unggah Dokumen</h2>
        
        <div className="pu-warning-box">
          <div className="pu-warning-icon">
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>i</span>
          </div>
          <p className="pu-warning-text">
            Selesaikan pendaftaran kamu sebelum {deadlineDate} ya! Jika terlewat semua data kamu akan dihapus dari sistem.
          </p>
        </div>

        <div className="pu-doc-list">
          {documents.map((doc) => (
            <div key={doc.id} className="pu-doc-item" onClick={() => handleDocClick(doc.id)}>
              <div className={`pu-doc-icon-container ${doc.verified ? 'is-verified' : ''}`}>
                {doc.verified && doc.photo ? (
                  <img 
                    src={doc.photo} 
                    alt={`Foto ${doc.title}`} 
                    className="pu-doc-thumbnail" 
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <ImageIcon size={28} color="#94a3b8" />
                )}
              </div>
              <div className="pu-doc-info">
                <h3 className="pu-doc-title">{doc.title}</h3>
                <span className={`pu-doc-status ${doc.verified ? 'verified' : ''}`}>
                  {doc.status}
                </span>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          ))}
        </div>
      </div>

      {(ktpVerified && simVerified && stnkVerified) && (
        <div className="pu-bottom-action animate-fade-in">
          <button 
            className="pu-daftar-btn"
            onClick={handleDaftarClick}
          >
            Daftar
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="pu-modal-overlay animate-fade-in">
          <div className="pu-modal-content animate-slide-up">
            <h3 className="pu-modal-title">Kamu yakin ingin melanjutkan dengan dokumen ini?</h3>
            <p className="pu-modal-desc">
              Cek kembali dokumenmu dan pastikan semuanya benar agar kamu tidak perlu menunggu jika ada kesalahan dalam proses verifikasi.
            </p>
            <div className="pu-modal-actions">
              <button className="pu-modal-btn-outline" onClick={closeConfirmModal}>Kembali</button>
              <button className="pu-modal-btn-primary" onClick={handleConfirmDaftar}>Ya, yakin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
