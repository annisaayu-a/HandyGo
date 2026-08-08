import { useState, useEffect } from 'react';
import { Bell, MapPin } from 'lucide-react';
import './Messages.css';

export default function CustomerMessages() {
  const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
  const userName = storedUser.name || 'Ajel';

  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!storedUser.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/orders?user_id=${storedUser.id}`);
        const data = await response.json();
        if (response.ok && data.orders && data.orders.length > 0) {
          const latestOrder = data.orders[0];
          if (latestOrder.status !== 'selesai' && latestOrder.status !== 'batal') {
            setActiveChat({
              id: 'active-1',
              name: 'Rafael gemam',
              status: latestOrder.service?.name === 'Antar Barang' 
                ? 'Kurir sedang menuju lokasi penjemputan.' 
                : 'Mohon menunggu, pesananmu sedang disiapkan.',
              image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch orders for chat", err);
      }
    };
    fetchOrders();
  }, [storedUser.id]);

  const chatHistory = [
    {
      id: 1,
      name: 'Rama Wicaksono',
      status: 'Pesanan selesai, chat ditutup.',
      image: 'https://ui-avatars.com/api/?name=Rama+Wicaksono&background=1e293b&color=fff'
    },
    {
      id: 2,
      name: 'Muhammad Alif',
      status: 'Pesanan selesai, chat ditutup.',
      image: 'https://ui-avatars.com/api/?name=Muhammad+Alif&background=1e293b&color=fff'
    },
    {
      id: 3,
      name: 'Rahmat Alam',
      status: 'Pesanan selesai, chat ditutup.',
      image: 'https://ui-avatars.com/api/?name=Rahmat+Alam&background=1e293b&color=fff'
    }
  ];

  return (
    <div className="customer-messages animate-fade-in">
      {/* Header Section */}
      <header className="home-header">
        <div className="profile-section">
          <img 
            src={`https://ui-avatars.com/api/?name=${userName}&background=034078&color=fff`} 
            alt="Profile" 
            className="profile-img"
          />
          <div className="profile-info">
            <h2 className="profile-name">{userName}</h2>
            <p className="profile-location">
              <MapPin size={12} className="location-icon" /> Kab. Gowa
            </p>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={20} />
        </button>
      </header>

      <h1 className="messages-page-title">Chat</h1>
      
      {activeChat ? (
        <div className="active-chat-section">
          <div className="chat-card active-chat-card">
            <img src={activeChat.image} alt={activeChat.name} className="chat-avatar" />
            <div className="chat-details">
              <h3 className="chat-name">{activeChat.name}</h3>
              <p className="chat-status active-text">{activeChat.status}</p>
            </div>
            <div className="active-indicator"></div>
          </div>
        </div>
      ) : (
        <p className="messages-subtitle">Tidak ada chat yang berlangsung</p>
      )}

      <div className="chat-history-section">
        <h2 className="chat-history-title">Riwayat Chat</h2>
        <p className="chat-history-desc">
          Riwayat chatmu akan hilang setiap 30 hari. Segera laporkan jika mitra kami mengganggu kenyamananmu ya!
        </p>

        <div className="chat-list">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="chat-card">
              <img src={chat.image} alt={chat.name} className="chat-avatar" />
              <div className="chat-details">
                <h3 className="chat-name">{chat.name}</h3>
                <p className="chat-status">{chat.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
