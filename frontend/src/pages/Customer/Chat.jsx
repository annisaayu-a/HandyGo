import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Paperclip, Mic, Image as ImageIcon, Camera, Send, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Chat.css';

const API = 'https://handygo-api.vercel.app';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();

  // orderId and mitra info are now passed via route state
  const orderId = location.state?.orderId || null;
  const isFinished = location.state?.isFinished || false;
  const isCallActive = location.state?.isCallActive || false;
  const initialCallTime = location.state?.initialCallTime || 0;

  const [mitraName, setMitraName] = useState(location.state?.mitraName || 'Mitra HandyGo');
  const [mitraAvatar, setMitraAvatar] = useState(
    location.state?.mitraAvatar ||
    'https://ui-avatars.com/api/?name=Mitra+HandyGo&background=034078&color=fff'
  );

  // If orderId was not passed but there's an active order in local storage, use it
  const [activeOrderId, setActiveOrderId] = useState(orderId);

  useEffect(() => {
    // If orderId not in state, try to get it from the most recent saved active order
    if (!activeOrderId) {
      const saved = localStorage.getItem('handygo_active_order_id');
      if (saved) setActiveOrderId(saved);
    }
  }, []);

  // Fetch mitra info from DB if not provided
  useEffect(() => {
    if (activeOrderId && mitraName === 'Mitra HandyGo') {
      fetch(`${API}/api/orders/${activeOrderId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.order?.mitra) {
            const m = data.order.mitra;
            setMitraName(m.full_name || 'Mitra HandyGo');
            setMitraAvatar(
              m.profile_picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name || 'Mitra')}&background=034078&color=fff`
            );
          }
        })
        .catch(() => {});
    }
  }, [activeOrderId]);

  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [activeCallTime, setActiveCallTime] = useState(initialCallTime);
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);

  const quickReplies = ['Lokasi sudah sesuai titik ya', 'Baik saya tunggu'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Poll messages from backend API
  useEffect(() => {
    if (!activeOrderId) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`${API}/api/chat/${activeOrderId}`);
        if (res.ok) {
          const data = await res.json();
          // Map DB messages to display format
          const mapped = data.messages.map(m => ({
            id: m.id,
            sender: m.sender_type, // 'customer' or 'mitra'
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
          }));
          setChatHistory(mapped);
        }
      } catch (e) {}
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [activeOrderId]);

  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setActiveCallTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m} : ${s}`;
  };

  const handleSend = async (text = message) => {
    if (!text.trim()) return;
    setMessage('');

    if (activeOrderId) {
      try {
        await fetch(`${API}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: activeOrderId, sender_type: 'customer', text })
        });
        // Optimistically add to local state
        const newMsg = {
          id: Date.now(),
          sender: 'customer',
          text,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
        };
        setChatHistory(prev => [...prev, newMsg]);
      } catch (e) {}
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        
        <div className="chat-mitra-profile">
          <img src={mitraAvatar} alt="Mitra" className="chat-mitra-avatar" />
          <div className="chat-mitra-info">
            <h1 className="chat-mitra-name">{mitraName}</h1>
            <div className="chat-mitra-rating">
              <span className="star">★</span> 4.9 <span className="reviews">(59 ulasan)</span>
            </div>
          </div>
        </div>

        <button className="chat-call-btn" onClick={() => !isFinished && navigate('/customer/call')} disabled={isFinished} style={{ cursor: isFinished ? 'default' : 'pointer' }}>
          <Phone size={20} color={isFinished ? "#cbd5e1" : "#034078"} fill="currentColor" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="chat-area">
        {isCallActive && (
          <div className="chat-active-call-banner" onClick={() => navigate('/customer/call')}>
            <div className="chat-active-call-left">
              <Phone size={16} color="#1e293b" fill="currentColor" />
              <span className="chat-active-call-name">{mitraName}</span>
            </div>
            <span className="chat-active-call-time">{formatTime(activeCallTime)}</span>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div key={msg.id} className={`chat-bubble-container ${msg.type === 'call_history' ? 'center' : (msg.sender === 'customer' ? 'right' : 'left')}`}>
            {msg.type === 'call_history' ? (
              <div className="chat-history-call-pill">
                <div className="chat-history-call-content">
                  <Phone size={14} color="#64748b" />
                  <span className="chat-history-call-title">{msg.title}</span>
                  <span className="chat-history-call-duration">{msg.duration}</span>
                </div>
                <div className="chat-history-call-time">{msg.time}</div>
              </div>
            ) : (
              <div className={`chat-bubble ${msg.sender === 'customer' ? 'customer-bubble' : 'mitra-bubble'}`}>
                <div className="chat-text">{msg.text}</div>
                <div className="chat-time">{msg.time}</div>
              </div>
            )}
          </div>
        ))}

        {isFinished && (
          <div className="chat-finished-container">
            <div className="chat-ended-pill">Chat sudah berakhir</div>
            <button className="chat-help-btn">
              <MessageSquare size={18} />
              Butuh bantuan?
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`chat-input-container ${isFinished ? 'disabled' : ''}`}>
        {/* Quick Replies */}
        {!isFinished && (
          <div className="chat-quick-replies">
            {quickReplies.map((reply, idx) => (
              <button 
                key={idx} 
                className="chat-quick-reply-btn"
                onClick={() => handleSend(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          <div className="chat-input-wrapper">
            <button className="chat-icon-btn attachment-btn" onClick={handleAttachmentClick} disabled={isFinished}>
              <Paperclip size={20} color={isFinished ? "#e2e8f0" : "#64748b"} />
            </button>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Pesan" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isFinished}
            />
          </div>
          
          {message.trim() && !isFinished ? (
            <button className="chat-icon-btn send-btn" onClick={() => handleSend()}>
              <Send size={20} color="#034078" />
            </button>
          ) : (
            <button className="chat-icon-btn mic-btn" disabled={isFinished}>
              <Mic size={20} color={isFinished ? "#e2e8f0" : "#64748b"} />
            </button>
          )}
        </div>
      </div>

      {/* Attachment Bottom Sheet */}
      {showAttachmentMenu && (
        <>
          <div className="chat-overlay" onClick={() => setShowAttachmentMenu(false)}></div>
          <div className="chat-attachment-sheet animate-slide-up">
            <h3 className="chat-attachment-title">Unggah Lampiran</h3>
            
            <button className="chat-attachment-item" onClick={() => setShowAttachmentMenu(false)}>
              <div className="chat-attachment-icon"><ImageIcon size={20} color="#64748b" /></div>
              <div className="chat-attachment-text">Galeri</div>
              <div className="chat-attachment-arrow">›</div>
            </button>
            
            <button className="chat-attachment-item" onClick={() => setShowAttachmentMenu(false)}>
              <div className="chat-attachment-icon"><Camera size={20} color="#64748b" /></div>
              <div className="chat-attachment-text">Ambil foto</div>
              <div className="chat-attachment-arrow">›</div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
