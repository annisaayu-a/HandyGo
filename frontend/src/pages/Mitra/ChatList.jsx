import { useState, useEffect } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Customer/ChatList.css'; // Reuse CSS

export default function MitraChatList() {
  const navigate = useNavigate();
  const [mitraName, setMitraName] = useState('Mitra HandyGo');
  const [mitraAvatar, setMitraAvatar] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mitra_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.full_name) setMitraName(parsed.full_name);
        else if (parsed.name) setMitraName(parsed.name);
        if (parsed.avatar) setMitraAvatar(parsed.avatar);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [activeChats, setActiveChats] = useState([]);

  const [historyChats, setHistoryChats] = useState([]);

  const handleOpenChat = (isFinished) => {
    navigate('/mitra/chat', { state: { isFinished } });
  };

  useEffect(() => {
    const checkOrderState = async () => {
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
          name: 'Hana', // Should ideally come from the order data
          lastMessage: lastMsg,
          avatar: 'https://ui-avatars.com/api/?name=Hana&background=cbd5e1&color=64748b',
          unread: 2,
        }]);
      } else {
        setActiveChats([]);
      }

      // Fetch history chats from backend
      try {
        const saved = localStorage.getItem('mitra_profile_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          let mitraId = parsed.id;
          
          if (!mitraId && parsed.phone) {
            const res = await fetch(`https://handygo-api.vercel.app/api/auth/mitra/profile?phone=${encodeURIComponent(parsed.phone)}`);
            if (res.ok) {
              const mData = await res.json();
              mitraId = mData.mitra.id;
              parsed.id = mitraId;
              localStorage.setItem('mitra_profile_data', JSON.stringify(parsed));
            }
          }

          if (mitraId) {
            const resOrders = await fetch(`https://handygo-api.vercel.app/api/orders?mitra_id=${mitraId}`);
            if (resOrders.ok) {
              const oData = await resOrders.json();
              const completedOrders = oData.orders.filter(o => o.status === 'selesai');
              
              const history = completedOrders.map(o => {
                const customerName = o.user?.full_name || 'Pelanggan';
                return {
                  id: o.id,
                  name: customerName,
                  lastMessage: 'Pesanan selesai, chat berakhir.',
                  avatar: o.user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=cbd5e1&color=64748b`
                };
              });
              
              setHistoryChats(history);
            }
          }
        }
      } catch(e) {}
    };

    checkOrderState();
    const interval = setInterval(checkOrderState, 3000);
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
                style={{ cursor: 'default' }}
                title="Riwayat chat belum bisa dibuka untuk saat ini"
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
