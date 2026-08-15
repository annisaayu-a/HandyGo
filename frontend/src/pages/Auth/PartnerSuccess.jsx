import { useNavigate } from 'react-router-dom';
import successIllus from '../../assets/mitra.png';
import './PartnerSuccess.css';

export default function PartnerSuccess() {
  const navigate = useNavigate();

  return (
    <div className="partner-success-container animate-fade-in">
      <div className="ps-header">
        <h1 className="ps-title">Pendaftaran Mitra HandyGo</h1>
      </div>

      <div className="ps-content">
        <img src={successIllus} alt="Success Illustration" className="ps-illustration" />
        
        <h2 className="ps-heading">Dokumen Sudah Terkirim Nih!</h2>
        
        <p className="ps-desc">
          Mohon tunggu pendaftaran kamu sedang diverifikasi dalam waktu maksimal 5 hari kerja. Selamat melanjutkan aktivitas!
        </p>
      </div>

      <div className="ps-bottom-action">
        <button 
          className="ps-status-btn"
          onClick={() => navigate('/partner-status')}
        >
          Lihat Status Pendaftaran
        </button>
      </div>
    </div>
  );
}
