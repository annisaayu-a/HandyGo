import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import './DeliveryDetails.css';

export default function DeliveryDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get locations from state, or fallback to mock data for UI testing
  const pickup = location.state?.pickupLocation || { name: 'Universitas Hasanuddin Fak...', address: 'Jl. Perintis Kemerdekaan' };
  const dropoff = location.state?.dropoffLocation || { name: 'Pondok Nabil', address: 'Jl. Sahabat' };

  const [detailLocation, setDetailLocation] = useState('');
  const [selectedSize, setSelectedSize] = useState(null); // 'kecil', 'sedang', 'besar'
  const [weight, setWeight] = useState('');
  
  const [selectedVehicle, setSelectedVehicle] = useState(null); // 'motor', 'mobil'
  const [isVehicleSheetOpen, setIsVehicleSheetOpen] = useState(true);

  const sizes = [
    { id: 'kecil', label: 'Kecil', max: 'Maks. 5 kg' },
    { id: 'sedang', label: 'Sedang', max: 'Maks. 20 kg' },
    { id: 'besar', label: 'Besar', max: 'Maks. 100 kg' }
  ];

  const vehicles = [
    { id: 'motor', name: 'Motor', desc: 'Paket kecil & sedang (maks. 20kg)', price: 'Rp 23.000', icon: '🛵' },
    { id: 'mobil', name: 'Mobil', desc: 'Paket besar (maks. 100kg)', price: 'Rp 89.000', icon: '🚗' }
  ];

  const handleSizeSelect = (sizeId) => {
    if (!selectedVehicle) return; // Prevent selection if no vehicle is chosen

    // Prevent selecting incompatible sizes
    if (selectedVehicle.id === 'motor' && sizeId === 'besar') return;
    
    setSelectedSize(sizeId);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleSheetOpen(false);
    
    // Reset selected size if it becomes incompatible
    if (vehicle.id === 'motor' && selectedSize === 'besar') {
      setSelectedSize(null);
    }
  };

  const isFormValid = selectedSize && weight.trim() !== '' && selectedVehicle;

  const handleSave = () => {
    if (!isFormValid) return;
    
    navigate('/customer/delivery/receiver', { 
      state: { pickup, dropoff, detailLocation, selectedSize, weight, selectedVehicle }
    });
  };

  return (
    <div className="delivery-details-container animate-fade-in">
      <header className="details-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="header-title">Antar Barang</h1>
      </header>

      <div className="details-content">
        {/* Location Card */}
        <div className="location-summary-card">
          <p className="summary-helper-text">Pastikan titik sudah sesuai ya!</p>
          
          <div className="location-point">
            <div className="point-header">
              <h3 className="point-title">Lokasi Pengambilan</h3>
              <button className="change-btn" onClick={() => navigate(-1)}>Ganti lokasi</button>
            </div>
            <p className="point-address">{pickup.name}</p>
          </div>

          <div className="location-point">
            <div className="point-header">
              <h3 className="point-title">Lokasi Pengantaran</h3>
              <button className="change-btn" onClick={() => navigate(-1)}>Ganti lokasi</button>
            </div>
            <p className="point-address">{dropoff.name}</p>
          </div>

          <div className="detail-input-wrapper">
            <Edit2 size={16} color="#94a3b8" className="detail-icon" />
            <input 
              type="text" 
              className="detail-input"
              placeholder="Tambahin detail lokasi yuk!"
              value={detailLocation}
              onChange={(e) => setDetailLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Size Selection */}
        <section className="size-section">
          <h2 className="section-title">Ukuran & berat barang</h2>
          <p className="section-subtitle">
            Pilih ukuran dan berat yang sesuai untuk menghindari pembatalan serta memastikan barangmu aman ya!
          </p>
          
          <div className="size-options">
            {sizes.map((size) => {
              const isDisabled = !selectedVehicle || (selectedVehicle.id === 'motor' && size.id === 'besar');
              return (
                <button 
                  key={size.id}
                  className={`size-card ${selectedSize === size.id ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => handleSizeSelect(size.id)}
                  disabled={isDisabled}
                  style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                >
                  <div className="size-label">{size.label}</div>
                  <div className="size-max">{size.max}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Weight Input */}
        <section className="weight-section">
          <h2 className="section-title">Berat barang</h2>
          <div className="weight-input-container">
            <input 
              type="number" 
              className="weight-input-with-unit"
              placeholder="Masukkan berat"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={!selectedVehicle}
              style={{ backgroundColor: !selectedVehicle ? '#f8fafc' : 'transparent', opacity: !selectedVehicle ? 0.6 : 1 }}
            />
            <span className="weight-unit">Kg</span>
          </div>
        </section>
      </div>

      <div className={`bottom-action-sheet ${isVehicleSheetOpen || selectedVehicle ? 'has-vehicle' : ''}`}>
        
        {/* Vehicle Selection Area */}
        {selectedVehicle && !isVehicleSheetOpen && (
          <div className="selected-vehicle-card" onClick={() => setIsVehicleSheetOpen(true)}>
            <div className="vehicle-drag-handle"></div>
            <div className="vehicle-info-row">
              <div className="vehicle-icon-wrapper">{selectedVehicle.icon}</div>
              <div className="vehicle-details">
                <h4 className="vehicle-name">{selectedVehicle.name}</h4>
                <p className="vehicle-desc">{selectedVehicle.desc}</p>
              </div>
              <div className="vehicle-price">{selectedVehicle.price}</div>
            </div>
          </div>
        )}

        {isVehicleSheetOpen && (
          <div className="vehicle-selection-sheet">
            <div className="vehicle-drag-handle" onClick={() => setIsVehicleSheetOpen(false)}></div>
            <div className="vehicle-list">
              {vehicles.map(vehicle => (
                <div 
                  key={vehicle.id} 
                  className={`vehicle-option ${selectedVehicle?.id === vehicle.id ? 'active' : ''}`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="vehicle-icon-wrapper">{vehicle.icon}</div>
                  <div className="vehicle-details">
                    <h4 className="vehicle-name">{vehicle.name}</h4>
                    <p className="vehicle-desc">{vehicle.desc}</p>
                  </div>
                  <div className="vehicle-price">{vehicle.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          className="save-btn" 
          disabled={!isFormValid}
          onClick={handleSave}
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
