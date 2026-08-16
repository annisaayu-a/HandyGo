import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, ShoppingBag, Bike, Wrench, CheckCircle2, Clock } from 'lucide-react';
import '../Customer/History.css';

export default function MitraJobs() {
  const navigate = useNavigate();
  const [mitraName, setMitraName] = useState('Joko Prasetyo');
  const [mitraAvatar, setMitraAvatar] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mitra_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setMitraName(parsed.name);
        if (parsed.avatar) setMitraAvatar(parsed.avatar);
      }
    } catch (e) {}
  }, []);

  const [historyData, setHistoryData] = useState([]);
  
  // Filter states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tempCategory, setTempCategory] = useState('');
  const [showToast, setShowToast] = useState(false);

  const categories = ['Belanja', 'Perbaikan', 'Pindahan', 'Antar Barang', 'Antar Jemput', 'Bersih-bersih'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [tempMonth, setTempMonth] = useState('');

  const fetchOrders = () => {
    // Generate static mockup data based on image
    const now = new Date();
    const currentMonthYear = `${months[now.getMonth()]} ${now.getFullYear()}`;
    // Using a fixed year for April to match mockup style if wanted, but using current year makes it logical
    const aprilYear = `April ${now.getFullYear()}`;

    let data = [
      {
        id: 1,
        service: 'Antar Barang',
        status: 'Sukses',
        date: 'Hari ini, 13:49',
        monthYearGroup: currentMonthYear,
        isCanceled: false,
        statusColor: '#1e293b'
      },
      {
        id: 2,
        service: 'Antar Jemput',
        status: 'Sukses',
        date: 'Kamis, 9 April, 15:23',
        monthYearGroup: aprilYear,
        isCanceled: false,
        statusColor: '#1e293b'
      },
      {
        id: 3,
        service: 'Belanja',
        status: 'Dibatalkan',
        date: 'Selasa, 7 April, 20:19',
        monthYearGroup: aprilYear,
        isCanceled: true,
        cancelReason: 'Toko tutup',
        statusColor: '#64748b'
      },
      {
        id: 4,
        service: 'Perbaikan',
        status: 'Sukses',
        date: 'Sabtu, 4 April, 17:08',
        monthYearGroup: aprilYear,
        isCanceled: false,
        statusColor: '#1e293b'
      },
      {
        id: 5,
        service: 'Antar Jemput',
        status: 'Sukses',
        date: 'Kamis, 9 April, 15:23',
        monthYearGroup: aprilYear,
        isCanceled: false,
        statusColor: '#1e293b'
      },
      {
        id: 6,
        service: 'Perbaikan',
        status: 'Sukses',
        date: 'Sabtu, 4 April, 17:08',
        monthYearGroup: aprilYear,
        isCanceled: false,
        statusColor: '#1e293b'
      }
    ];

    // Check if there is an active simulated order in localStorage
    try {
      const orderStr = localStorage.getItem('simulated_incoming_order');
      if (orderStr) {
        const order = JSON.parse(orderStr);
        if (order.accepted && !['completed', 'completed_qris_success'].includes(order.driverPhase)) {
          // It's active! Add to the top of current month
          const orderDate = new Date(order.timestamp || Date.now());
          const timeStr = orderDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
          
          data.unshift({
            id: 'active_order',
            service: order.service,
            status: 'Aktif',
            date: `Hari ini, ${timeStr}`,
            monthYearGroup: currentMonthYear,
            isCanceled: false,
            isActive: true,
            statusColor: '#034078' // Same as primary color
          });
        }
      }
    } catch(e) {}

    setHistoryData(data);
  };

  useEffect(() => {
    fetchOrders();
    // Poll to keep active status updated
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, []);

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
    filteredData = filteredData.filter(item => item.date.toLowerCase().includes(selectedMonth.toLowerCase()) || item.monthYearGroup.toLowerCase().includes(selectedMonth.toLowerCase()));
  }

  // Group by month
  const groupedHistory = filteredData.reduce((acc, item) => {
    const groupKey = item.monthYearGroup;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

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
    <div className="customer-history animate-fade-in" style={{ paddingBottom: '80px' }}>
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
            {mitraAvatar ? (
               <img src={mitraAvatar} alt="Profile" className="profile-img" />
            ) : (
               <img src={`https://ui-avatars.com/api/?name=${mitraName}&background=034078&color=fff`} alt="Profile" className="profile-img" />
            )}
            <div className="profile-info">
              <h2 className="profile-name">{mitraName}</h2>
              <p className="profile-location">
                <MapPin size={12} className="location-icon" /> Kota Makassar
              </p>
            </div>
          </div>
          <button className="notification-btn" onClick={() => navigate('/mitra/notifications')}>
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
            <span className="filter-icon">📅</span> Bulan
          </button>
        </div>
      </div>

      {/* Scrollable List Section */}
      <div className="history-scrollable-list">
        {Object.entries(groupedHistory).map(([month, items]) => (
          <div key={month} className="history-month-group">
            <h3 className="history-month-title">{month}</h3>
            <div className="history-list">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`history-card ${item.isCanceled ? 'canceled' : ''}`}
                  style={{ cursor: item.isActive ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (item.isActive) {
                      navigate('/mitra'); // Go to dashboard where active order is shown
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
                    {item.isCanceled && item.cancelReason && (
                      <p className="history-rating" style={{ color: '#94a3b8' }}>{item.cancelReason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedHistory).length === 0 && (
          <div className="history-empty-card">
            <div className="history-empty-icon">
              <Clock size={20} color="#94a3b8" />
            </div>
            <h4 className="history-empty-title">Belum ada riwayat pesanan</h4>
            <p className="history-empty-subtitle">Coba pilih kategori lain</p>
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
              <span className="filter-icon">📅</span> Bulan
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
