import { useState, useEffect } from 'react';
import { PhoneOff, Volume2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Customer/Call.css';

export default function MitraCall() {
  const navigate = useNavigate();
  
  // State: 'ringing', 'connected'
  const [callState, setCallState] = useState('ringing');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Auto-connect after 3 seconds for simulation
  useEffect(() => {
    let timer;
    if (callState === 'ringing') {
      timer = setTimeout(() => {
        setCallState('connected');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [callState]);

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

  const handleDecline = () => {
    navigate(-1);
  };

  const handleChat = () => {
    navigate('/mitra/chat', { state: { isCallActive: true, initialCallTime: elapsedTime } });
  };

  return (
    <div className="call-page animate-fade-in">
      <div className="call-header">
        <h1 className="call-logo-text" style={{ fontStyle: 'italic', color: '#0ea5e9' }}>HG</h1>
        <h2 className="call-name">Hana</h2>
        <p className="call-number">+628521940009</p>
      </div>

      <div className={`call-avatar-container ${callState === 'connected' ? 'connected' : 'ringing'}`}>
        <img 
          src="https://ui-avatars.com/api/?name=Hana&background=cbd5e1&color=64748b" 
          alt="Customer Avatar" 
          className="call-avatar"
        />
        {callState === 'connected' ? (
          <div className="call-timer" style={{ marginTop: '24px' }}>{formatTime(elapsedTime)}</div>
        ) : (
          <div className="call-timer" style={{ marginTop: '24px' }}>Berdering</div>
        )}
      </div>

      <div className="call-actions-container">
        {callState === 'ringing' ? (
          <div className="call-actions-ringing" style={{ justifyContent: 'center' }}>
            <button className="call-btn decline-btn" onClick={handleDecline} style={{ backgroundColor: '#dc2626' }}>
              <PhoneOff size={28} color="#ffffff" fill="currentColor" />
            </button>
          </div>
        ) : (
          <div className="call-actions-connected">
            <button 
              className={`call-small-btn ${isSpeakerOn ? 'active' : ''}`}
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              style={{ backgroundColor: isSpeakerOn ? '#e2e8f0' : 'transparent', border: isSpeakerOn ? 'none' : '1px solid #cbd5e1' }}
            >
              <Volume2 size={24} color={isSpeakerOn ? "#1e293b" : "#94a3b8"} fill={isSpeakerOn ? "currentColor" : "none"} />
            </button>
            <button className="call-btn decline-btn" onClick={handleDecline} style={{ backgroundColor: '#dc2626' }}>
              <PhoneOff size={28} color="#ffffff" fill="currentColor" />
            </button>
            <button className="call-small-btn" onClick={handleChat} style={{ backgroundColor: 'transparent', border: '1px solid #cbd5e1' }}>
              <MessageCircle size={24} color="#94a3b8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
