import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Help.css';

const CATEGORIES = ['Layanan Error', 'Masalah dengan Haku', 'Pembatalan', 'Lainnya'];

export default function Help() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMitra = location.pathname.startsWith('/mitra');
  const backPath = isMitra ? '/mitra/protection' : '/customer/protection';

  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      setSelectedCategory('');
    }, 2000);
  };

  return (
    <div className="help-container animate-fade-in">
      <div className="help-header">
        <button className="help-back-btn" onClick={() => navigate(backPath)}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <h1 className="help-title">Butuh Bantuan?</h1>
      </div>

      <div className="help-content">
        {/* Illustration */}
        <div className="help-illustration">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <circle cx="50" cy="35" r="18" fill="#60a5fa" />
            {/* Head */}
            <circle cx="50" cy="22" r="13" fill="#fbbf24" />
            {/* Headset arc */}
            <path d="M37 22 Q37 9 50 9 Q63 9 63 22" stroke="#1e40af" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Headset ear left */}
            <rect x="33" y="20" width="7" height="10" rx="3" fill="#1e40af" />
            {/* Headset ear right */}
            <rect x="60" y="20" width="7" height="10" rx="3" fill="#1e40af" />
            {/* Mic */}
            <path d="M56 30 Q60 34 58 38" stroke="#1e40af" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Shirt */}
            <path d="M32 50 Q30 70 50 72 Q70 70 68 50 Q60 42 50 42 Q40 42 32 50Z" fill="#93c5fd" />
          </svg>
        </div>

        <h2 className="help-headline">Kami selalu ada untukmu</h2>
        <p className="help-subtitle">Ada kendala apa?</p>
      </div>

      {/* Category Chips + Message at bottom */}
      <div className="help-bottom-section">
        <div className="help-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`help-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="help-input-row">
          <input
            className="help-input"
            type="text"
            placeholder="Pesan"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          />
          <button
            className={`help-send-btn ${message.trim() ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!message.trim()}
          >
            {sent ? '✓' : '→'}
          </button>
        </div>

        {sent && (
          <p className="help-sent-msg">Pesan terkirim! Tim kami akan segera menghubungimu.</p>
        )}
      </div>
    </div>
  );
}
