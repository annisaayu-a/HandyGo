import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, ShoppingBag, Bike, Wrench, CheckCircle2, Clock } from 'lucide-react';
import './History.css';

export default function CustomerHistory() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('handyGoUser') || '{}');
  const userName = storedUser.name || 'Ajel';

  const [historyData, setHistoryData] = useState(() => {
    // ⚡ Load cached history instantly on first render (no loading delay)
    try {
      const cached = localStorage.getItem(`handyGoHistory_${storedUser.id}`);
      if (cached) return JSON.parse(cached);
    } catch (e) { /* ignore */ }
    return [];
  });
  const [, setLoading] = useState(true);

  // Filter states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(''); // active filter
  const [tempCategory, setTempCategory] = useState(''); // for modal selection before apply
  const [showToast, setShowToast] = useState(false);

  const categories = [
    'Belanja', 'Perbaikan', 'Pindahan',
    'Antar Barang', 'Antar Jemput', 'Bersih-bersih'
  ];

  const months = [
    'Januari', 'Februari', 'Maret',
    'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September',
    'Oktober', 'November', 'Desember'
  ];

  // Month filter states
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(''); // active filter
  const [tempMonth, setTempMonth] = useState(''); // for modal selection before apply

  useEffect(() => {
    const fetchOrders = async () => {
      if (!storedUser.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`https://handygo-api.vercel.app/api/orders?user_id=${storedUser.id}`);
        const data = await response.json();
      if (response.ok) {
          const savedRatings = JSON.parse(localStorage.getItem('handyGoRatings') || '{}');
          // Format data to match UI
          const formattedOrders = data.orders.map(order => {
            const isCanceled = order.status === 'batal';
            const ratingData = savedRatings[order.id];
            
            const dateObj = new Date(order.created_at);
            const now = new Date();
            const isToday = dateObj.getDate() === now.getDate() && dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
            
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
            
            let dateStr = '';
            if (isToday) {
              dateStr = `Hari ini, ${timeStr}`;
            } else {
              const dayStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
              const dateMonthStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
              dateStr = `${dayStr}, ${dateMonthStr}, ${timeStr}`;
            }

            const monthYearGroup = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

            let displayStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            if (order.status === 'selesai') displayStatus = 'Sukses';
            if (isCanceled) displayStatus = 'Dibatalkan';

            return {
              id: order.id,
              service: order.service?.name || 'Layanan',
              status: displayStatus,
              date: dateStr,
              monthYearGroup: monthYearGroup,
              ratingValue: ratingData ? ratingData.rating : null,
              isCanceled: isCanceled,
              statusColor: isCanceled ? '#64748b' : '#1e293b',
              pesanan: order.order_details // Pass the details for the status page
            };
          });
          // ⚡ Save to localStorage for instant load next time
          try {
            localStorage.setItem(`handyGoHistory_${storedUser.id}`, JSON.stringify(formattedOrders));
          } catch (e) { /* ignore quota errors */ }
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
    if (serviceName.toLowerCase().includes('belanja')) return <ShoppingBag size={24} color="#034078" />;
    if (serviceName.toLowerCase().includes('antar')) return <Bike size={24} color="#034078" />;
    if (serviceName.toLowerCase().includes('perbaikan')) return <Wrench size={24} color="#034078" />;
    return <ShoppingBag size={24} color="#034078" />;
  };

  // Apply filters (Category + Month)
  let filteredData = historyData;
  if (selectedCategory) {
    filteredData = filteredData.filter(item => item.service.toLowerCase().includes(selectedCategory.toLowerCase()));
  }
  if (selectedMonth) {
    filteredData = filteredData.filter(item => item.date.toLowerCase().includes(selectedMonth.toLowerCase()));
  }

  // Group by month
  const groupedHistory = filteredData.reduce((acc, item) => {
    const groupKey = item.monthYearGroup;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  // For the exact UI match, we will just hardcode the groups to match the Figma if historyData is empty or just use the grouped data
  // When applying filter to mockup data, we filter it as well
  let displayGroups = groupedHistory;

  if (historyData.length === 0 && (selectedCategory || selectedMonth)) {
    const filteredMockup = {};
    Object.entries(displayGroups).forEach(([month, items]) => {
      let filteredItems = items;
      if (selectedCategory) {
        filteredItems = filteredItems.filter(item => item.service.toLowerCase().includes(selectedCategory.toLowerCase()));
      }
      if (selectedMonth) {
        // filter by month string
        if (!month.toLowerCase().includes(selectedMonth.toLowerCase())) {
          filteredItems = [];
        }
      }
      
      if (filteredItems.length > 0) {
        filteredMockup[month] = filteredItems;
      }
    });
    displayGroups = filteredMockup;
  }

  const handleOpenCategoryModal = () => {
    setTempCategory(selectedCategory);
    setShowCategoryModal(true);
  };

  const handleApplyCategoryFilter = () => {
    setSelectedCategory(tempCategory);
    setShowCategoryModal(false);
    if (tempCategory) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleOpenMonthModal = () => {
    setTempMonth(selectedMonth);
    setShowMonthModal(true);
  };

  const handleApplyMonthFilter = () => {
    setSelectedMonth(tempMonth);
    setShowMonthModal(false);
    if (tempMonth) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="customer-history animate-fade-in">
      {/* Toast Notification */}
      {showToast && (
        <div className="history-toast animate-slide-down">
          <CheckCircle2 size={20} color="#22c55e" fill="#dcfce7" />
          <span className="history-toast-text">Filter diterapkan</span>
        </div>
      )}

      {/* Fixed Header Section */}
      <div className="history-fixed-header">
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
        
        {/* Filters */}
        <div className="history-filters">
          <button 
            className={`history-filter-btn ${selectedCategory ? 'active-filter' : ''}`}
            onClick={handleOpenCategoryModal}
          >
            <span className="filter-icon">🏷️</span> Kategori layanan
          </button>
          <button 
            className={`history-filter-btn ${selectedMonth ? 'active-filter' : ''}`}
            onClick={handleOpenMonthModal}
          >
            <span className="filter-icon">📅</span> Bulan & Tahun
          </button>
        </div>
      </div>

      {/* Scrollable List Section */}
      <div className="history-scrollable-list">
        {Object.entries(displayGroups).map(([month, items]) => (
          <div key={month} className="history-month-group">
            <h3 className="history-month-title">{month}</h3>
            <div className="history-list">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`history-card ${item.isCanceled ? 'canceled' : ''}`}
                  style={{ cursor: (!item.isCanceled) ? 'pointer' : 'default' }}
                  onClick={() => {
                    const serviceType = item.service.toLowerCase();
                    let route = '/customer/shopping/status'; // default
                    if (serviceType.includes('antar barang')) route = '/customer/delivery/status';
                    else if (serviceType.includes('perbaikan')) route = '/customer/repair/status';
                    else if (serviceType.includes('bersih')) route = '/customer/cleaning/status';

                    if (item.status.toLowerCase() === 'menunggu') {
                      navigate(route, { state: { pesanan: item.pesanan, orderStatus: 'disiapkan', status: 'coming', orderId: item.id } });
                    } else if (!item.isCanceled) {
                      navigate(route, { state: { pesanan: item.pesanan, orderStatus: 'selesai', status: 'finished', orderId: item.id } });
                    }
                  }}
                >
                  <div className="history-icon">
                    {getServiceIcon(item.service)}
                  </div>
                  <div className="history-details">
                    <h3 className="history-service-name">{item.service}</h3>
                    <p className="history-status">
                      <span style={{ color: item.statusColor, fontWeight: '500' }}>{item.status}</span> • {item.date}
                    </p>
                    {item.ratingValue ? (
                      <p className="history-rating rated">
                        Kamu memberi rating <span className="star-icon">★</span> {item.ratingValue.toFixed(1)}
                      </p>
                    ) : (
                      <p className="history-rating">{item.isCanceled ? (item.pesanan?.cancel_reason || 'Toko tutup') : 'Belum diberi rating'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(displayGroups).length === 0 && (
          <div className="history-empty-card">
            <div className="history-empty-icon">
              <Clock size={20} color="#94a3b8" />
            </div>
            {historyData.length === 0 ? (
              <h4 className="history-empty-title">Belum ada riwayat</h4>
            ) : (
              <>
                <h4 className="history-empty-title">Belum ada pesanan untuk kategori ini</h4>
                <p className="history-empty-subtitle">Coba pilih kategori lain untuk melihat riwayat pesanan</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Modal */}
      {showCategoryModal && (
        <div className="history-modal-overlay">
          <div className="history-modal animate-scale-up">
            <div className="history-modal-header">
              <span className="filter-icon">🏷️</span> Kategori Layanan
            </div>
            <div className="category-pill-grid">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${tempCategory === cat ? 'active' : ''}`}
                  onClick={() => setTempCategory(tempCategory === cat ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="history-modal-actions">
              <button className="history-btn-outline" onClick={() => setShowCategoryModal(false)}>
                Kembali
              </button>
              <button className="history-btn-solid" onClick={handleApplyCategoryFilter}>
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month Filter Modal */}
      {showMonthModal && (
        <div className="history-modal-overlay">
          <div className="history-modal animate-scale-up">
            <div className="history-modal-header">
              <span className="filter-icon">📅</span> Bulan & Tahun
            </div>
            <div className="month-pill-grid">
              {months.map((m) => (
                <button
                  key={m}
                  className={`month-pill ${tempMonth === m ? 'active' : ''}`}
                  onClick={() => setTempMonth(tempMonth === m ? '' : m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="history-modal-actions">
              <button className="history-btn-outline" onClick={() => setShowMonthModal(false)}>
                Kembali
              </button>
              <button className="history-btn-solid" onClick={handleApplyMonthFilter}>
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
