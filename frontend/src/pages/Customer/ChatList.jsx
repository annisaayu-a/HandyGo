import { useState } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ChatList.css';

export default function ChatList() {
  const navigate = useNavigate();

  const [activeChats, setActiveChats] = useState([]);

  const [historyChats, setHistoryChats] = useState([
    {
      id: 2,
      name: 'Rama Wicaksono',
      lastMessage: 'Pesanan selesai, chat berakhir.',
      avatar: 'https://i.pravatar.cc/150?img=33'
    },
    {
      id: 3,
      name: 'Muhammad Alif',
      lastMessage: 'Pesanan selesai, chat berakhir.',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 4,
      name: 'Rahmat Alam',
      lastMessage: 'Pesanan selesai, chat berakhir.',
      avatar: 'https://i.pravatar.cc/150?img=53'
    }
  ]);

  const handleOpenChat = (isFinished) => {
    navigate('/customer/chat', { state: { isFinished } });
  };

  useEffect(() => {
    const checkOrderState = () => {
      const orderStr = localStorage.getItem('simulated_incoming_order');
      const chatStr = localStorage.getItem('handygo_active_chat_messages');
      let lastMsg = 'Sy Mnuju ke lokasi sekarang kk';
      
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
          name: 'Rafael Gemam',
          lastMessage: lastMsg,
          avatar: 'https://i.pravatar.cc/150?img=11',
          unread: 1,
        }]);
      } else {
        setActiveChats([]);
      }
    };

    checkOrderState();
    const interval = setInterval(checkOrderState, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chatlist-page animate-fade-in">
      {/* Header */}
      <header className="chatlist-header">
        <div className="chatlist-profile">
          <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="chatlist-avatar" />
          <div className="chatlist-profile-info">
            <h1 className="chatlist-name">Ajel</h1>
            <div className="chatlist-location">
              <MapPin size={12} color="#034078" />
              <span>Kab. Gowa</span>
            </div>
          </div>
        </div>
        <button className="chatlist-bell">
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
            Riwayat chatmu akan hilang setiap 30 hari. Segera laporkan jika mitra kami mengganggu kenyamananmu
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
