import { Bell, MapPin, ShoppingBag, Bike, Wrench } from 'lucide-react';
import './History.css';

export default function CustomerHistory() {
  const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
  const userName = storedUser.name || 'Ajel';

  const historyData = [
    {
      id: 1,
      service: 'Belanja',
      status: 'Sukses',
      date: 'Hari ini, 10:48 WITA',
      ratingText: 'Belum diberi rating',
      icon: <ShoppingBag size={24} />,
      statusColor: '#1e293b'
    },
    {
      id: 2,
      service: 'Antar Jemput',
      status: 'Sukses',
      date: 'Kamis, 9 April, 15:23 WITA',
      ratingText: 'Kamu memberi rating ⭐️ 4.9',
      icon: <Bike size={24} />,
      statusColor: '#1e293b'
    },
    {
      id: 3,
      service: 'Belanja',
      status: 'Dibatalkan',
      date: 'Selasa, 7 April, 20:19 WITA',
      ratingText: 'Toko tutup',
      icon: <ShoppingBag size={24} />,
      statusColor: '#64748b',
      isCanceled: true
    },
    {
      id: 4,
      service: 'Perbaikan',
      status: 'Sukses',
      date: 'Sabtu, 4 April, 17:08 WITA',
      ratingText: 'Kamu memberi rating ⭐️ 5.0',
      icon: <Wrench size={24} />,
      statusColor: '#1e293b'
    }
  ];

  return (
    <div className="customer-history animate-fade-in">
      {/* Header Section (Reused styling from Home) */}
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

      <h1 className="history-page-title">Riwayat</h1>

      <div className="history-list">
        {historyData.map((item) => (
          <div key={item.id} className={`history-card ${item.isCanceled ? 'canceled' : ''}`}>
            <div className="history-icon">
              {item.icon}
            </div>
            <div className="history-details">
              <h3 className="history-service-name">{item.service}</h3>
              <p className="history-status">
                <span style={{ color: item.statusColor, fontWeight: '600' }}>{item.status}</span> • {item.date}
              </p>
              <p className="history-rating">{item.ratingText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
