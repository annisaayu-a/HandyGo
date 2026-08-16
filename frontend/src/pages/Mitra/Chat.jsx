import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Paperclip, Mic, Image as ImageIcon, Camera, Send, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Customer/Chat.css'; // Reusing customer chat CSS

export default function MitraChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const isFinished = location.state?.isFinished || false;
  
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([]);

  // Mitra specific quick replies based on user image
  const quickReplies = ['Saya sudah dilokasi kak', 'Oke, tunggu ya', 'Sesuai titik kan kak'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Sync with localStorage to simulate real-time chat
  useEffect(() => {
    const loadMessages = () => {
      const saved = localStorage.getItem('handygo_active_chat_messages');
      if (saved) {
        setChatHistory(JSON.parse(saved));
      }
    };
    
    // Initial load
    loadMessages();

    // Listen for storage changes from other tabs/windows (Customer simulator)
    window.addEventListener('storage', loadMessages);
    
    // Also poll every 1 second just in case we are in the same window
    const interval = setInterval(loadMessages, 1000);

    return () => {
      window.removeEventListener('storage', loadMessages);
      clearInterval(interval);
    };
  }, []);

  const handleSend = (text = message) => {
    if (!text.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'mitra',
      text: text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
    };
    
    const newHistory = [...chatHistory, newMessage];
    setChatHistory(newHistory);
    localStorage.setItem('handygo_active_chat_messages', JSON.stringify(newHistory));
    setMessage('');
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
          <img src="https://ui-avatars.com/api/?name=Hana&background=cbd5e1&color=64748b" alt="Customer" className="chat-mitra-avatar" />
          <div className="chat-mitra-info">
            <h1 className="chat-mitra-name">Hana</h1>
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
