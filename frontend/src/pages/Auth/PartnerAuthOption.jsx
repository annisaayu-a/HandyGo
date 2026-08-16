import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PartnerAuthOption.css';

export default function PartnerAuthOption() {
  const navigate = useNavigate();

  return (
    <div className="pauth-container animate-fade-in">
      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <button className="pauth-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={24} color="#1e293b" />
      </button>

      <div className="pauth-content">
        <div className="pauth-buttons">
          <button 
            className="pauth-daftar-btn" 
            onClick={() => navigate('/partner-welcome')}
          >
            Daftar
          </button>
          <button 
            className="pauth-masuk-btn" 
            onClick={() => navigate('/login')}
          >
            Masuk
          </button>
        </div>
      </div>
    </div>
  );
}
