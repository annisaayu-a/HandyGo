import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import './PartnerUpload.css';

export default function PartnerUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deadlineDate, setDeadlineDate] = useState('');
  
  const ktpVerified = location.state?.ktpVerified || false;

  useEffect(() => {
    // Ambil tanggal pendaftaran dari simulasi localStorage, atau gunakan hari ini
    const regDateStr = localStorage.getItem('partnerRegistrationDate');
    const baseDate = regDateStr ? new Date(regDateStr) : new Date();
    
    // Tambah 3 hari
    baseDate.setDate(baseDate.getDate() + 3);
    
    const formattedDate = baseDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setDeadlineDate(formattedDate);
  }, []);

  const documents = [
    { 
      id: 'ktp', 
      title: 'KTP', 
      status: ktpVerified ? 'Sudah diunggah' : 'Belum diunggah',
      verified: ktpVerified
    },
    { id: 'sim', title: 'SIM', status: 'Belum diunggah', verified: false },
    { id: 'stnk', title: 'STNK', status: 'Belum diunggah', verified: false }
  ];

  const handleDocClick = (id) => {
    if (id === 'ktp') {
      navigate('/partner-camera');
    } else {
      alert(`Simulasi: Fitur upload untuk ${id.toUpperCase()} belum tersedia`);
    }
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
            <svg viewBox="0 0 24 24" fill="#facc15" width="20" height="20">
              <circle cx="12" cy="12" r="12" fill="#facc15" />
              <text x="12" y="16" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">i</text>
            </svg>
          </div>
          <p className="pu-warning-text">
            Selesaikan pendaftaran kamu sebelum {deadlineDate} ya! Jika terlewat semua data kamu akan dihapus dari sistem.
          </p>
        </div>

        <div className="pu-doc-list">
          {documents.map((doc) => (
            <div key={doc.id} className="pu-doc-item" onClick={() => handleDocClick(doc.id)}>
              <div className="pu-doc-icon-container">
                {doc.verified ? (
                  <CheckCircle2 size={28} color="#16a34a" />
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
    </div>
  );
}
