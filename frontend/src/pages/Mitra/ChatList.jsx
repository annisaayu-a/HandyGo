import { useState, useEffect } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Customer/ChatList.css'; // Reuse CSS

export default function MitraChatList() {
  const navigate = useNavigate();
  const [mitraName, setMitraName] = useState('Budiono Siregar');
  const [mitraAvatar, setMitraAvatar] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mitra_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setMitraName(parsed.name);
        if (parsed.avatar) setMitraAvatar(parsed.avatar);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [activeChats, setActiveChats] = useState([]);

  const [historyChats, setHistoryChats] = useState([
    {
      id: 2,
      name: 'Ahmad Rizal',
      lastMessage: 'Pesanan selesai, chat berakhir.',
      avatar: 'https://i.pravatar.cc/150?img=33'
    },
    {
      id: 3,
      name: 'Budi Santoso',
      lastMessage: 'Pesanan selesai, chat berakhir.',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 4,
      name: 'Dewi Lestari',
      lastMessage: 'Pesanan selesai, chat berakhir.',
      avatar: 'https://i.pravatar.cc/150?img=53'
    }
  ]);

  const handleOpenChat = (isFinished) => {
    navigate('/mitra/chat', { state: { isFinished } });
  };

  useEffect(() => {
    const checkOrderState = () => {
      const orderStr = localStorage.getItem('simulated_incoming_order');
      const chatStr = localStorage.getItem('handygo_active_chat_messages');
      let lastMsg = 'Hati hati kak'; // Default as in image
      
      if (chatStr) {
        try {
          const msgs = JSON.parse(chatStr);
          if (msgs.length > 0) {
            lastMsg = msgs[msgs.length - 1].text;
          }
        } catch(e) {}
      }

      let isOrderActive = false;
      if (orderStr) {
        try {
          const order = JSON.parse(orderStr);
          if (order.accepted && !['completed', 'completed_qris_success'].includes(order.driverPhase)) {
            isOrderActive = true;
          }
        } catch (e) {}
      }

      if (isOrderActive) {
        setActiveChats([{
          id: 1,
          name: 'Hana',
          lastMessage: lastMsg,
          avatar: 'https://ui-avatars.com/api/?name=Hana&background=cbd5e1&color=64748b',
          unread: 2,
        }]);
      } else {
        setActiveChats([]);
        // If order finished and we had a chat, we could add it to history here
        // For simplicity, we just leave it in the hardcoded history below
      }
    };

    checkOrderState();
    const interval = setInterval(checkOrderState, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chatlist-page animate-fade-in" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <header className="chatlist-header">
        <div className="chatlist-profile">
          {mitraAvatar ? (
             <img src={mitraAvatar} alt="Profile" className="chatlist-avatar" />
          ) : (
             <img src={`https://ui-avatars.com/api/?name=${mitraName}&background=034078&color=fff`} alt="Profile" className="chatlist-avatar" />
          )}
          <div className="chatlist-profile-info">
            <h1 className="chatlist-name">{mitraName}</h1>
            <div className="chatlist-location">
              <MapPin size={12} color="#034078" />
              <span>Makassar</span>
            </div>
          </div>
        </div>
        <button className="chatlist-bell" onClick={() => navigate('/mitra/notifications')}>
          <Bell size={24} color="#1e293b" />
        </button>
      </header>

      <main className="chatlist-content">
        {/* Active Chats Section */}
        <section className="chatlist-section">
          <h2 className="chatlist-section-title">Chat</h2>
          {activeChats.length > 0 ? (
            <div className="chatlist-items">
              {activeChats.map(chat => (
                <div 
                  key={chat.id} 
                  className="chatlist-card"
                  onClick={() => handleOpenChat(false)}
                >
                  <img src={chat.avatar} alt={chat.name} className="chatlist-card-avatar" />
                  <div className="chatlist-card-text">
                    <h3 className="chatlist-card-name">{chat.name}</h3>
                    <p className="chatlist-card-msg">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="chatlist-unread-badge">{chat.unread}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="chatlist-empty-text">Tidak ada pesanan yang sedang berlangsung</p>
          )}
        </section>

        {/* History Chats Section */}
        <section className="chatlist-section">
          <h2 className="chatlist-section-title">Riwayat Chat</h2>
          <p className="chatlist-history-desc">
            Riwayat chatmu akan hilang setiap 30 hari. Segera laporkan jika pelanggan setia kami mengganggu kenyamananmu
          </p>
          
          <div className="chatlist-items">
            {historyChats.map(chat => (
              <div 
                key={chat.id} 
                className="chatlist-card"
                onClick={() => handleOpenChat(true)}
              >
                <img src={chat.avatar} alt={chat.name} className="chatlist-card-avatar" />
                <div className="chatlist-card-text">
                  <h3 className="chatlist-card-name">{chat.name}</h3>
                  <p className="chatlist-card-msg finished">{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
