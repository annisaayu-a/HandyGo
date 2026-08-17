import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, ChevronRight, ChevronDown, Camera, Image as ImageIcon, PlusCircle, ShieldCheck, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RepairDetails.css';

export default function RepairDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const repairTypeTitle = location.state?.repairTypeTitle || 'Kelistrikan';
  
  const [address, setAddress] = useState('');
  const [detailLokasi, setDetailLokasi] = useState(
    location.state?.detailLokasi || sessionStorage.getItem('repairDetailLocation') || ''
  );
  
  useEffect(() => {
    sessionStorage.setItem('repairDetailLocation', detailLokasi);
  }, [detailLokasi]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState('');
  const [tingkatKerusakan, setTingkatKerusakan] = useState(''); 
  const [deskripsi, setDeskripsi] = useState('');
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showEstimationSheet, setShowEstimationSheet] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  
  useEffect(() => {
    if (location.state && location.state.selectedLocation) {
      setAddress(location.state.selectedLocation.address || location.state.selectedLocation.name);
    } else {
      const userStr = localStorage.getItem('handyGoUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.default_location) {
          setAddress(user.default_location);
        }
      }
    }
  }, [location.state]);

  const isKelistrikan = repairTypeTitle.toLowerCase().includes('listrik') || repairTypeTitle.toLowerCase() === 'kelistrikan';
  
  const categories = isKelistrikan ? [
    { id: 'lampu', title: 'Lampu Mati', icon: '💡' },
    { id: 'saklar', title: 'Saklar Rusak' },
    { id: 'stopkontak', title: 'Stop Kontak Biasa' },
    { id: 'mcb', title: 'MCB Turun' },
    { id: 'instalasi', title: 'Instalasi Listrik' }
  ] : [
    { id: 'tv', title: 'TV' },
    { id: 'mesin_cuci', title: 'Mesin Cuci' },
    { id: 'kulkas', title: 'Kulkas' },
    { id: 'dispenser', title: 'Dispenser' },
    { id: 'kipas', title: 'Kipas' }
  ];

  const handleMockUpload = () => {
    if (uploadedPhotos.length >= 5) return;
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')}.${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newPhoto = {
      id: Date.now(),
      name: `WhatsApp Image ${now.toISOString().split('T')[0]} at ${timeString}`,
      // A simple gray placeholder data URI for thumbnail
      thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%23e2e8f0"/></svg>'
    };
    
    setUploadedPhotos([...uploadedPhotos, newPhoto]);
    setShowPhotoOptions(false);
  };

  const isFormComplete = selectedKategori && tingkatKerusakan && deskripsi;

  const handleLanjut = () => {
    if (!isFormComplete) return;
    setShowEstimationSheet(true);
  };

  const handlePesanSekarang = async () => {
    setShowEstimationSheet(false);
    
    const userStr = localStorage.getItem('handyGoUser');
    let user = null;
    if (userStr) {
      try { user = JSON.parse(userStr); } catch (e) { }
    }
    
    if (!user || !user.id) {
      alert("Anda harus masuk (login) terlebih dahulu.");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('https://handygo-api.vercel.app/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          service_name: 'Perbaikan',
          pickup_location: location.state?.detailLokasi ? `${location.state?.selectedLocation?.address || location.state?.selectedLocation?.name || 'BTP Blok G 114'} - ${location.state.detailLokasi}` : (location.state?.selectedLocation?.address || location.state?.selectedLocation?.name || 'BTP Blok G 114'),
          dropoff_location: location.state?.detailLokasi ? `${location.state?.selectedLocation?.address || location.state?.selectedLocation?.name || 'BTP Blok G 114'} - ${location.state.detailLokasi}` : (location.state?.selectedLocation?.address || location.state?.selectedLocation?.name || 'BTP Blok G 114'),
          order_details: `Kategori: ${selectedKategori}, Rusak: ${tingkatKerusakan}, Desc: ${deskripsi}`,
          estimated_price: 70000,
          payment_method: 'cash'
        })
      });

      let createdOrderId = null;
      if (response.ok) {
        const data = await response.json();
        createdOrderId = data.order?.id;
      }

      // Real order is created via API above

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/customer/finding-driver', { 
          state: { 
            nextRoute: '/customer/repair/status',
            nextState: { 
              selectedLocation: location.state?.selectedLocation || { address: 'BTP Blok G 114' },
              selectedKategori,
              tingkatKerusakan,
              deskripsi,
              uploadedPhotos,
              orderId: createdOrderId
            }
          } 
        });
      }, 2000);
    } catch (error) {
      console.error("Gagal membuat pesanan:", error);
      alert("Terjadi kesalahan, pesanan tidak dapat dibuat.");
    }
  };

  return (
    <div className="cleaning-checkout-page animate-fade-in" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <header className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="rd-title">Perbaikan</h1>
      </header>

      {/* Content */}
      <div className="rd-content">
        {/* Location Card */}
        <div className="rd-location-card">
          <div className="rd-location-header">
            <div>
              <h2 className="rd-location-title">Lokasi</h2>
              <p className="rd-location-address">{address || 'Memuat alamat...'}</p>
            </div>
            <button className="rd-ganti-lokasi" onClick={() => navigate('/customer/search-location', { state: { returnUrl: '/customer/repair/details', repairTypeTitle } })}>
              Ganti lokasi
            </button>
          </div>
          <div className="rd-detail-input-wrapper">
            <Edit3 size={16} className="rd-detail-icon" />
            <input 
              type="text" 
              className="rd-detail-input" 
              placeholder="Tambahin detail lokasi yuk!"
              value={detailLokasi}
              onChange={(e) => setDetailLokasi(e.target.value)}
            />
          </div>
        </div>

        {/* Info Text */}
        <div className="rd-info-text-container">
          <div className="rd-info-text-top">
            <span style={{ color: '#334155', fontWeight: 500 }}>Layanan ini akan menghitung total harga<br/>berdasarkan hasil pengecekan kondisi<br/>kerusakan oleh tim kami.</span>
            <ChevronRight size={16} color="#cbd5e1" style={{ marginTop: '2px' }} />
          </div>
          <div className="rd-info-text-bottom">
            Lihat syarat dan ketentuannya di sini.
          </div>
        </div>

        {/* Kategori Dropdown */}
        <div className="rd-section">
          <h2 className="rd-section-title">{repairTypeTitle}</h2>
          <div className="rd-dropdown-container">
            <div className="rd-dropdown-header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {selectedKategori ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {categories.find(c => c.title === selectedKategori)?.icon && (
                     <span>{categories.find(c => c.title === selectedKategori).icon}</span>
                  )}
                  <span className="rd-dropdown-text">{selectedKategori}</span>
                </div>
              ) : (
                <span className="rd-dropdown-text placeholder">{isKelistrikan ? "Pilih jenis listrik" : "Pilih jenis elektronik"}</span>
              )}
              {isDropdownOpen ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
            </div>
            
            {isDropdownOpen && (
              <div className="rd-dropdown-list animate-fade-in">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className={`rd-dropdown-item ${selectedKategori === cat.title ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedKategori(cat.title);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {cat.icon && <span style={{ marginRight: '8px' }}>{cat.icon}</span>}
                    {cat.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tingkat Kerusakan */}
        <div className="rd-section">
          <h2 className="rd-section-title">Tingkat kerusakan</h2>
          <div className="rd-pill-group">
            {['Ringan', 'Sedang', 'Berat'].map((tingkat) => (
              <button 
                key={tingkat}
                className={`rd-pill ${tingkatKerusakan === tingkat ? 'active' : ''}`}
                onClick={() => setTingkatKerusakan(tingkat)}
              >
                {tingkat}
              </button>
            ))}
          </div>
        </div>

        {/* Unggah Foto */}
        <div className="rd-section">
          <h2 className="rd-section-title">Unggah foto</h2>
          
          {uploadedPhotos.length > 0 ? (
            <div className="rd-uploaded-list">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="rd-uploaded-item">
                  <img src={photo.thumbnail} alt="thumbnail" className="rd-uploaded-thumb" />
                  <span className="rd-uploaded-name">{photo.name}</span>
                </div>
              ))}
              
              <button 
                className="rd-add-photo-btn"
                onClick={() => setShowPhotoOptions(true)}
                disabled={uploadedPhotos.length >= 5}
              >
                <PlusCircle size={18} /> Tambah
              </button>
            </div>
          ) : (
            <div className="rd-upload-box" onClick={() => setShowPhotoOptions(true)}>
              <Camera size={32} className="rd-upload-icon" />
              <span className="rd-upload-text">Tambahkan maksimal 5 foto</span>
            </div>
          )}
        </div>

        {/* Deskripsi */}
        <div className="rd-section">
          <h2 className="rd-section-title">Deskripsi</h2>
          <textarea 
            className="rd-notes-input" 
            placeholder="Jelaskan kerusakan yang kamu alami di sini"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows="3"
            style={{ borderRadius: '16px', padding: '16px' }}
          ></textarea>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div className="rd-bottom-sticky">
        <button 
          className="rd-submit-btn" 
          onClick={handleLanjut}
          style={{ 
            opacity: isFormComplete ? 1 : 0.2, 
            cursor: isFormComplete ? 'pointer' : 'not-allowed',
            backgroundColor: isFormComplete ? '#034078' : '#cbd5e1',
            color: isFormComplete ? '#ffffff' : '#475569'
          }}
        >
          Lanjut
        </button>
      </div>
      {/* Photo Options Bottom Sheet */}
      {showPhotoOptions && (
        <div className="rd-overlay" onClick={() => setShowPhotoOptions(false)}>
          <div className="rd-photo-sheet" onClick={e => e.stopPropagation()}>
            <h3 className="rd-photo-sheet-title">Unggah Foto</h3>
            
            <div className="rd-photo-option" onClick={handleMockUpload}>
              <div className="rd-photo-option-left">
                <ImageIcon size={24} className="rd-photo-option-icon" />
                <span>Pilih dari galeri</span>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
            
            <div className="rd-photo-option" onClick={handleMockUpload}>
              <div className="rd-photo-option-left">
                <Camera size={24} className="rd-photo-option-icon" />
                <span>Ambil foto</span>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          </div>
        </div>
      )}
      {/* Estimation Bottom Sheet */}
      {showEstimationSheet && (
        <div className="rd-overlay" onClick={() => setShowEstimationSheet(false)}>
          <div className="rd-estimation-sheet" onClick={e => e.stopPropagation()}>
            <div className="rd-estimation-header">
              <div className="rd-estimation-title-wrapper">
                <h3 className="rd-estimation-title">Estimasi Perbaikan</h3>
                <p className="rd-estimation-subtitle">Berdasarkan kategori dan tingkat kerusakan</p>
              </div>
              <div className="rd-estimation-price-main">Rp 60.000 - 100.000</div>
            </div>

            <div className="rd-alert-box">
              <ShieldCheck size={20} className="rd-alert-icon" />
              <p className="rd-alert-text">
                Estimasi perbaikan dapat berubah setelah teknisi melakukan pemeriksaan. Namun, <strong>tidak akan melebihi Rp 100.000</strong> tanpa persetujuan kamu terlebih dahulu. Jika diperlukan biaya tambahan, teknisi akan mengkonfirmasi.
              </p>
            </div>

            <div className="rd-breakdown-row">
              <div className="rd-breakdown-label">
                <div className="rd-breakdown-icon-wrapper">
                  <span style={{ fontSize: '1.2rem' }}>👨‍🔧</span>
                </div>
                <span>Biaya Kunjungan</span>
              </div>
              <div className="rd-breakdown-value">Rp 20.000</div>
            </div>

            <div className="rd-breakdown-row">
              <div className="rd-breakdown-label">
                <div className="rd-breakdown-icon-wrapper"></div>
                <span>Estimasi Perbaikan</span>
              </div>
              <div className="rd-breakdown-value">Rp 60.000 - 100.000</div>
            </div>

            <div className="rd-estimation-divider"></div>

            <div className="rd-total-row">
              <div className="rd-total-label">Estimasi Total</div>
              <div className="rd-total-value">Rp 80.000 - 120.000</div>
            </div>

            <button className="rd-submit-btn" onClick={handlePesanSekarang} style={{ opacity: 1, backgroundColor: '#034078', color: '#ffffff' }}>
              Pesan Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="rd-overlay">
          <div className="rd-success-modal">
            <div className="rd-success-icon-circle">
              <Check size={36} strokeWidth={3} />
            </div>
            <h3 className="rd-success-title">Pesananmu Berhasil!</h3>
          </div>
        </div>
      )}
    </div>
  );
}
