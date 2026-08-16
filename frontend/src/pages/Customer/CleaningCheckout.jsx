import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, ChevronRight, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import bucketIllustration from '../../assets/hero.png'; // Fallback image if we don't have bucket icon
import './CleaningCheckout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CleaningCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [address, setAddress] = useState('');
  const [detailLokasi, setDetailLokasi] = useState(sessionStorage.getItem('cleaningDetailLocation') || '');
  
  useEffect(() => {
    sessionStorage.setItem('cleaningDetailLocation', detailLokasi);
  }, [detailLokasi]);
  const [luasArea, setLuasArea] = useState(''); 
  const [tingkatKekotoran, setTingkatKekotoran] = useState(''); 
  const [catatan, setCatatan] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bayar di Tempat');
  
  const [showModal, setShowModal] = useState(false);

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

  // Calculate Duration and Price
  const getDuration = () => {
    if (!luasArea || !tingkatKekotoran) return 0;
    
    let base = 2; // Default for < 50
    if (luasArea === '50 - 100 m²') base = 3;
    if (luasArea === '≥100 m²') base = 4;
    
    let extra = 0;
    if (tingkatKekotoran === 'Sedang') extra = 1;
    if (tingkatKekotoran === 'Berat') extra = 2;
    
    return base + extra;
  };

  const durasi = getDuration();
  const tarifPerJam = 60000;
  const biayaLayanan = 8000;
  const totalHarga = durasi > 0 ? (durasi * tarifPerJam) + biayaLayanan : 0;

  const isFormComplete = luasArea && tingkatKekotoran;

  const handlePesan = async () => {
    if (!isFormComplete) return;

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
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          service_name: 'Bersih-bersih',
          pickup_location: detailLokasi ? `${address} - ${detailLokasi}` : address,
          dropoff_location: detailLokasi ? `${address} - ${detailLokasi}` : address,
          order_details: `Luas: ${luasArea}, Kotor: ${tingkatKekotoran}${catatan ? `, Catatan: ${catatan}` : ''}`,
          estimated_price: totalHarga,
          payment_method: 'cash'
        })
      });

      let createdOrderId = null;
      if (response.ok) {
        const data = await response.json();
        createdOrderId = data.order?.id;
      }

      // Simulate sending order to Mitra via localStorage
      localStorage.setItem('simulated_incoming_order', JSON.stringify({
        id: createdOrderId || Date.now(),
        service: 'Bersih-Bersih',
        destination: detailLokasi ? `${address} - ${detailLokasi}` : address,
        luasArea: luasArea,
        tingkatKekotoran: tingkatKekotoran,
        durasi: durasi,
        jumlahPetugas: 1, // Defaulting to 1 as per design
        paymentMethod: paymentMethod,
        total: totalHarga,
        timestamp: Date.now()
      }));

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/customer/finding-driver', {
          state: {
            nextRoute: '/customer/cleaning/status',
            nextState: {
              orderData: {
                address: detailLokasi ? `${address} - ${detailLokasi}` : address,
                luasArea,
                tingkatKekotoran,
                durasi,
                catatan
              },
              totalPrice: totalHarga,
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
    <div className="cleaning-checkout-page animate-fade-in">
      {/* Header */}
      <header className="cc-header">
        <button className="cc-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="cc-title">Bersih-bersih</h1>
      </header>

      {/* Content */}
      <div className="cc-content">
        {/* Location Card */}
        <div className="cc-location-card">
          <div className="cc-location-header">
            <div>
              <h2 className="cc-location-title">Lokasi</h2>
              <p className="cc-location-address">{address}</p>
            </div>
            <button className="cc-ganti-lokasi" onClick={() => navigate('/customer/search-location', { state: { returnUrl: '/customer/cleaning/checkout' } })}>
              Ganti lokasi
            </button>
          </div>
          <div className="cc-detail-input-wrapper">
            <Edit3 size={16} className="cc-detail-icon" />
            <input 
              type="text" 
              className="cc-detail-input" 
              placeholder="Tambahin detail lokasi yuk!"
              value={detailLokasi}
              onChange={(e) => setDetailLokasi(e.target.value)}
            />
          </div>
        </div>

        {/* Info Text */}
        <div className="cc-info-text-container">
          <div className="cc-info-text-top">
            <span style={{ color: '#334155', fontWeight: 500 }}>Layanan ini akan menghitung total harga<br/>berdasarkan waktu yang dibutuhkan.</span>
            <ChevronRight size={16} color="#cbd5e1" style={{ marginTop: '2px' }} />
          </div>
          <div className="cc-info-text-bottom">
            Lihat syarat dan ketentuannya di sini.
          </div>
        </div>

        {/* Luas Area */}
        <div className="cc-section">
          <h2 className="cc-section-title">Luas Area</h2>
          <div className="cc-pill-group">
            {['< 50 m²', '50 - 100 m²', '≥100 m²'].map((area) => (
              <button 
                key={area}
                className={`cc-pill ${luasArea === area ? 'active' : ''}`}
                onClick={() => setLuasArea(area)}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Tingkat Kekotoran */}
        <div className="cc-section">
          <h2 className="cc-section-title">Tingkat kekotoran</h2>
          <div className="cc-pill-group">
            {['Ringan', 'Sedang', 'Berat'].map((tingkat) => (
              <button 
                key={tingkat}
                className={`cc-pill ${tingkatKekotoran === tingkat ? 'active' : ''}`}
                onClick={() => setTingkatKekotoran(tingkat)}
              >
                {tingkat}
              </button>
            ))}
          </div>
        </div>

        {/* Catatan Khusus */}
        <div className="cc-section">
          <h2 className="cc-section-title">Catatan khusus</h2>
          <textarea 
            className="cc-notes-input" 
            placeholder="Contoh: Fokus di dapur, ada hewan peliharaan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows="2"
          ></textarea>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="cc-bottom-sheet">
        <div className="cc-price-row">
          <div className="cc-price-label">
            <div className="cc-price-icon-wrapper">
              <img src={bucketIllustration} alt="icon" style={{width: 20, height: 20, objectFit: 'contain'}} onError={(e) => e.target.style.display='none'} />
            </div>
            <div>
              <div style={{marginBottom: 4}}>Tarif per jam</div>
              <div style={{marginBottom: 4}}>Estimasi Durasi</div>
              <div>Biaya Layanan</div>
            </div>
          </div>
          <div style={{textAlign: 'right', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600}}>
            <div style={{marginBottom: 4}}>Rp {tarifPerJam.toLocaleString('id-ID')}</div>
            <div style={{marginBottom: 4}}>{durasi > 0 ? `${durasi} jam` : '-'}</div>
            <div>Rp {durasi > 0 ? biayaLayanan.toLocaleString('id-ID') : '0'}</div>
          </div>
        </div>
        
        <div className="cc-price-divider"></div>
        
        <div className="cc-total-row">
          <div className="cc-total-label">Estimasi Total</div>
          <div className="cc-total-value">Rp {totalHarga.toLocaleString('id-ID')}</div>
        </div>
        
        <p className="cc-disclaimer">
          Total harga bersifat estimasi dan dapat berubah sesuai durasi serta kondisi pekerjaan. Tim kami akan mengonfirmasi biaya terlebih dahulu sebelum layanan dimulai.
        </p>

        <div className="cc-section" style={{ marginTop: '16px' }}>
          <h2 className="cc-section-title" style={{ fontSize: '0.95rem' }}>Metode Pembayaran</h2>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', outline: 'none' }}
          >
            <option value="Bayar di Tempat">Tunai / Bayar di Tempat</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>
        
        <button 
          className="cc-submit-btn" 
          onClick={handlePesan}
          style={{ 
            opacity: isFormComplete ? 1 : 0.5, 
            cursor: isFormComplete ? 'pointer' : 'not-allowed' 
          }}
        >
          Pesan Sekarang
        </button>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="cc-modal-overlay">
          <div className="cc-modal-content">
            <div className="cc-modal-icon">
              <Check size={32} />
            </div>
            <h2 className="cc-modal-title">Pesananmu Berhasil!</h2>
          </div>
        </div>
      )}
    </div>
  );
}
