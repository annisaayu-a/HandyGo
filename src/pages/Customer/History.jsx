import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, ShoppingBag, Bike, Wrench } from 'lucide-react';
import './History.css';

export default function CustomerHistory() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
  const userName = storedUser.name || 'Ajel';

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!storedUser.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/orders?user_id=${storedUser.id}`);
        const data = await response.json();
        if (response.ok) {
          // Format data to match UI
          const formattedOrders = data.orders.map(order => {
            const isCanceled = order.status === 'batal';
            
            // Format date 
            const dateObj = new Date(order.created_at);
            const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + ' WITA';

            return {
              id: order.id,
              service: order.service?.name || 'Layanan',
              status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
              date: dateStr,
              ratingText: 'Belum diberi rating',
              isCanceled: isCanceled,
              statusColor: isCanceled ? '#64748b' : '#1e293b',
              pesanan: order.order_details // Pass the details for the status page
            };
          });
          setHistoryData(formattedOrders);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [storedUser.id]);

  const getServiceIcon = (serviceName) => {
    if (serviceName.toLowerCase().includes('belanja')) return <ShoppingBag size={24} />;
    if (serviceName.toLowerCase().includes('antar')) return <Bike size={24} />;
    if (serviceName.toLowerCase().includes('perbaikan')) return <Wrench size={24} />;
    return <ShoppingBag size={24} />;
  };

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
          <div 
            key={item.id} 
            className={`history-card ${item.isCanceled ? 'canceled' : ''}`}
            style={{ cursor: item.status.toLowerCase() === 'menunggu' ? 'pointer' : 'default' }}
            onClick={() => {
              if (item.status.toLowerCase() === 'menunggu') {
                navigate('/customer/shopping/status', { state: { pesanan: item.pesanan } });
              }
            }}
          >
            <div className="history-icon">
              {getServiceIcon(item.service)}
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
