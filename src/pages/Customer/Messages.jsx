import { Bell, MapPin } from 'lucide-react';
import './Messages.css';

export default function CustomerMessages() {
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
            src="https://ui-avatars.com/api/?name=Ajel&background=034078&color=fff" 
            alt="Profile" 
            className="profile-img"
          />
          <div className="profile-info">
            <h2 className="profile-name">Ajel</h2>
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
      <p className="messages-subtitle">Tidak ada chat yang berlangsung</p>

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
