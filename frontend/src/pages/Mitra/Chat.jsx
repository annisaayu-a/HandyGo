import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Paperclip, Mic, Image as ImageIcon, Camera, Send, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Customer/Chat.css'; // Reusing customer chat CSS

const API = 'https://handygo-api.vercel.app';

export default function MitraChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const isFinished = location.state?.isFinished || false;
  const orderId = location.state?.orderId || null;

  const [customerName, setCustomerName] = useState('Pelanggan');
  const [customerAvatar, setCustomerAvatar] = useState('https://ui-avatars.com/api/?name=Pelanggan&background=cbd5e1&color=64748b');

  // If no orderId in state, see if we have a recent one
  const [activeOrderId, setActiveOrderId] = useState(orderId);

  useEffect(() => {
    if (!activeOrderId) {
      const saved = localStorage.getItem('handygo_active_order_id');
      if (saved) setActiveOrderId(saved);
    }
  }, []);

  // Fetch customer info from DB order
  useEffect(() => {
    if (activeOrderId) {
      fetch(`${API}/api/orders/${activeOrderId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.order?.user) {
            const u = data.order.user;
            setCustomerName(u.full_name || 'Pelanggan');
            setCustomerAvatar(
              u.profile_picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'Pelanggan')}&background=cbd5e1&color=64748b`
            );
          }
        })
        .catch(() => {});
    }
  }, [activeOrderId]);

  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);

  // Mitra specific quick replies
  const quickReplies = ['Saya sudah dilokasi kak', 'Oke, tunggu ya', 'Sesuai titik kan kak'];

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

  const handleSend = async (text = message) => {
    if (!text.trim()) return;
    setMessage('');

    if (activeOrderId) {
      try {
        await fetch(`${API}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: activeOrderId, sender_type: 'mitra', text })
        });
        // Optimistically add to local state
        const newMsg = {
          id: Date.now(),
          sender: 'mitra',
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
    <div className="chat-page animate-fade-in">
      {/* Header */}
      <header className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        
        <div className="chat-mitra-profile">
          <img src={customerAvatar} alt="Customer" className="chat-mitra-avatar" />
          <div className="chat-mitra-info">
            <h1 className="chat-mitra-name">{customerName}</h1>
            <div className="chat-mitra-rating">
              <span className="star">★</span> 5.0
            </div>
          </div>
        </div>

        <button className="chat-call-btn" onClick={() => !isFinished && navigate('/mitra/call')} disabled={isFinished} style={{ cursor: isFinished ? 'default' : 'pointer' }}>
          <Phone size={20} color={isFinished ? "#cbd5e1" : "#d1d5db"} fill="currentColor" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="chat-area">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`chat-bubble-container ${msg.sender === 'mitra' ? 'right' : 'left'}`}>
            <div className={`chat-bubble ${msg.sender === 'mitra' ? 'mitra-bubble' : 'customer-bubble'}`} style={msg.sender === 'mitra' ? { borderBottomRightRadius: '4px', borderBottomLeftRadius: '12px' } : { borderBottomLeftRadius: '4px', borderBottomRightRadius: '12px' }}>
              <div className="chat-text">{msg.text}</div>
              <div className="chat-time">{msg.time}</div>
            </div>
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
