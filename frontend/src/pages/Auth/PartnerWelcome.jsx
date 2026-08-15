import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PartnerWelcome.css';
import partnerIcon from '../../assets/partner_illustration.png';

export default function PartnerWelcome() {
  const navigate = useNavigate();

  return (
    <div className="partner-welcome-container animate-fade-in">
      
      {/* Wavy Background shape matching the screenshot */}
      <div className="partner-wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="partner-wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,0L1440,0L1440,192C1320,192,1200,64,1080,64C960,64,840,192,720,192C600,192,480,64,360,64C240,64,120,192,60,256L0,320Z"></path>
        </svg>
      </div>

      <button className="pw-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="#1e293b" />
      </button>

      <div className="pw-content">
        <div className="pw-illustration-wrapper">
          <img src={partnerIcon} alt="Mitra Illustration" className="pw-illustration" />
        </div>

        <h2 className="pw-greeting">Halo mitra!</h2>
        <p className="pw-sub-greeting">Udah siap mulai perjalananmu?</p>
      </div>

      <div className="pw-bottom-action">
        <button 
          className="pw-start-btn" 
          onClick={() => alert('Lanjut ke pendaftaran mitra!')}
        >
          Yuk Mulai!
        </button>
      </div>
    </div>
  );
}
