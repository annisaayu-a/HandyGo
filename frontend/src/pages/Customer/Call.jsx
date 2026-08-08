import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Volume2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import hgLogo from '../../assets/logo.png'; // Assuming we have a logo, or use text if not
import './Call.css';

export default function Call() {
  const navigate = useNavigate();
  
  // State: 'ringing', 'connected'
  const [callState, setCallState] = useState('ringing');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    let interval;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m} : ${s}`;
  };

  const handleAccept = () => {
    setCallState('connected');
  };

  const handleDecline = () => {
    navigate(-1);
  };

  const handleChat = () => {
    navigate('/customer/chat', { state: { isCallActive: true, initialCallTime: elapsedTime } });
  };

  return (
    <div className="call-page animate-fade-in">
      <div className="call-header">
        <h1 className="call-logo-text">HG</h1>
        <h2 className="call-name">Rafael Gemam</h2>
        <p className="call-number">+628521940009</p>
      </div>

      <div className={`call-avatar-container ${callState === 'connected' ? 'connected' : 'ringing'}`}>
        <img 
          src="https://i.pravatar.cc/300?img=11" 
          alt="Caller Avatar" 
          className="call-avatar"
        />
        {callState === 'connected' && (
          <div className="call-timer">{formatTime(elapsedTime)}</div>
        )}
      </div>

      <div className="call-actions-container">
        {callState === 'ringing' ? (
          <div className="call-actions-ringing">
            <button className="call-btn decline-btn" onClick={handleDecline}>
              <PhoneOff size={28} color="#ffffff" fill="currentColor" />
            </button>
            <button className="call-btn accept-btn" onClick={handleAccept}>
              <Phone size={28} color="#ffffff" fill="currentColor" />
            </button>
          </div>
        ) : (
          <div className="call-actions-connected">
            <button 
              className={`call-small-btn ${isSpeakerOn ? 'active' : ''}`}
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            >
              <Volume2 size={24} color={isSpeakerOn ? "#1e293b" : "#94a3b8"} fill={isSpeakerOn ? "currentColor" : "none"} />
            </button>
            <button className="call-btn decline-btn" onClick={handleDecline}>
              <PhoneOff size={28} color="#ffffff" fill="currentColor" />
            </button>
            <button className="call-small-btn" onClick={handleChat}>
              <MessageCircle size={24} color="#94a3b8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
