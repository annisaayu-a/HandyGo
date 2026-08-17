import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ChatList.css';

const API = 'https://handygo-api.vercel.app';

export default function ChatList() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Pengguna');
  const [userAvatar, setUserAvatar] = useState('https://ui-avatars.com/api/?name=Pengguna&background=cbd5e1&color=64748b');

  // Load customer profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('handyGoUser');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.full_name) setUserName(parsed.full_name);
        else if (parsed.name) setUserName(parsed.name);
        if (parsed.profile_picture) setUserAvatar(parsed.profile_picture);
      }
    } catch(e) {}
  }, []);

  const [activeChats, setActiveChats] = useState([]);
  const [historyChats, setHistoryChats] = useState([]);

  const handleOpenChat = (orderId, mitraName, mitraAvatar, isFinished) => {
    navigate('/customer/chat', { state: { orderId, mitraName, mitraAvatar, isFinished } });
  };

  useEffect(() => {
    const checkOrders = async () => {
      // Get active order from localStorage
      const activeOrderId = localStorage.getItem('handygo_active_order_id');

      if (activeOrderId) {
        try {
          const res = await fetch(`${API}/api/orders/${activeOrderId}`);
          if (res.ok) {
            const data = await res.json();
            const order = data.order;
            
            if (order && order.status !== 'selesai' && order.status !== 'batal' && order.status !== 'menunggu' && order.mitra) {
              const mitraName = order.mitra.full_name || 'Mitra HandyGo';
              const mitraAvatar = order.mitra.profile_picture || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=034078&color=fff`;
              
              // Fetch last message for preview
              let lastMsg = 'Mitra sedang dalam perjalanan...';
              try {
                const chatRes = await fetch(`${API}/api/chat/${activeOrderId}`);
                if (chatRes.ok) {
                  const chatData = await chatRes.json();
                  if (chatData.messages && chatData.messages.length > 0) {
                    lastMsg = chatData.messages[chatData.messages.length - 1].text;
                    if (lastMsg.length > 50) lastMsg = lastMsg.substring(0, 50) + '...';
                  }
                }
              } catch(e) {}
              
              setActiveChats([{
                id: activeOrderId,
                name: mitraName,
                lastMessage: lastMsg,
                avatar: mitraAvatar,
                unread: 1,
                mitraAvatar
              }]);
            } else if (order && order.status === 'selesai') {
              setActiveChats([]);
            }
          }
        } catch(e) {}
      }

      // Get history orders from API based on user id
      try {
        const userStr = localStorage.getItem('handyGoUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.id) {
            const res = await fetch(`${API}/api/orders?user_id=${user.id}`);
            if (res.ok) {
              const data = await res.json();
              const completedOrders = (data.orders || []).filter(o => o.status === 'selesai' && o.mitra);
              const history = completedOrders.map(o => {
                const mitraName = o.mitra?.full_name || 'Mitra HandyGo';
                return {
                  id: o.id,
                  name: mitraName,
                  lastMessage: 'Pesanan selesai, chat berakhir.',
                  avatar: o.mitra?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=034078&color=fff`,
                  mitraAvatar: o.mitra?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=034078&color=fff`
                };
              });
              setHistoryChats(history);
            }
          }
        }
      } catch(e) {}
    };

    checkOrders();
    const interval = setInterval(checkOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chatlist-page animate-fade-in">
      {/* Header */}
      <header className="chatlist-header">
        <div className="chatlist-profile">
          <img src={userAvatar} alt="Profile" className="chatlist-avatar" />
          <div className="chatlist-profile-info">
            <h1 className="chatlist-name">{userName}</h1>
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
                  onClick={() => handleOpenChat(chat.id, chat.name, chat.mitraAvatar, false)}
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
            {historyChats.length === 0 ? (
              <p className="chatlist-empty-text">Belum ada riwayat chat</p>
            ) : (
              historyChats.map(chat => (
                <div 
                  key={chat.id} 
                  className="chatlist-card"
                  onClick={() => handleOpenChat(chat.id, chat.name, chat.mitraAvatar, true)}
                >
                  <img src={chat.avatar} alt={chat.name} className="chatlist-card-avatar" />
                  <div className="chatlist-card-text">
                    <h3 className="chatlist-card-name">{chat.name}</h3>
                    <p className="chatlist-card-msg finished">{chat.lastMessage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
