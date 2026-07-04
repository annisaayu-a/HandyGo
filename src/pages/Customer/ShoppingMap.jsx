import { useState } from 'react';
import { ArrowUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ShoppingMap.css';

export default function ShoppingMap() {
  const navigate = useNavigate();

  // Mock addresses to cycle through when the map is dragged
  const addresses = [
    { name: "Kost Ernias", address: "Romang Lompoa, Kec. Bontomarannu, Kabupaten Gowa, Sulawesi Selatan, Indonesia" },
    { name: "Fakultas Teknik Unhas", address: "Jl. Poros Malino, Gowa, Sulawesi Selatan, Indonesia" },
    { name: "Warkop Bundu Gowa", address: "Jl. Bontomarannu, Gowa, Sulawesi Selatan, Indonesia" },
    { name: "Asrama Mahasiswa", address: "Jl. Teknik Raya, Kabupaten Gowa, Sulawesi Selatan, Indonesia" },
    { name: "Indomaret Poros Malino", address: "Jl. Poros Malino KM 15, Kabupaten Gowa, Indonesia" }
  ];

  const [addressIndex, setAddressIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [step, setStep] = useState('toko'); // 'toko' or 'pengantaran'
  const [tokoLocation, setTokoLocation] = useState(null);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Change address sequentially when drag ends to simulate finding a new location
      setAddressIndex((prev) => (prev + 1) % addresses.length);
    }
  };

  return (
    <div className="shopping-map-page animate-fade-in">
      {/* Full screen Map */}
      <div 
        className="fullscreen-map"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', overflow: 'hidden' }}
      >
        <div style={{
          position: 'absolute',
          top: '-100%', left: '-100%',
          width: '300%', height: '300%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          pointerEvents: 'none'
        }}>
          <iframe 
            src="https://www.openstreetmap.org/export/embed.html?bbox=119.45%2C-5.18%2C119.55%2C-5.08&amp;layer=mapnik" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
          ></iframe>
        </div>
        
        {/* Custom Map Pin (Mock) */}
        <div className="map-pin-center" style={{ pointerEvents: 'none' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#034078"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Floating Top Search Card */}
      <div className="floating-top-card">
        <div className="location-input-group">
          <ArrowUp size={20} className="input-icon-up" />
          <input 
            type="text" 
            className="location-input" 
            placeholder="Cari lokasi toko"
            value={step === 'pengantaran' ? tokoLocation.name : ''}
            readOnly={step === 'pengantaran'}
          />
        </div>
        <div className="location-divider"></div>
        <div className="location-input-group">
          <Target size={20} className="input-icon-target" />
          <input 
            type="text" 
            className="location-input" 
            placeholder="Cari lokasi pengantaran"
          />
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bottom-sheet">
        <div className="bottom-sheet-header">
          <h2 className="sheet-title">
            {step === 'toko' ? 'Set lokasi toko' : 'Set lokasi pengantaran'}
          </h2>
          <button className="edit-btn">Edit</button>
        </div>
        
        <div className="selected-location-box">
          <h3 className="location-name">{addresses[addressIndex].name}</h3>
          <p className="location-address">
            {addresses[addressIndex].address}
          </p>
        </div>

        <button 
          className="submit-btn" 
          style={{ marginTop: '16px' }}
          onClick={() => {
            if (step === 'toko') {
              setTokoLocation(addresses[addressIndex]);
              setStep('pengantaran');
              // Optionally change the map visual state slightly or reset index
              setAddressIndex((prev) => (prev + 1) % addresses.length);
            } else {
              // Both selected, proceed to details page
              navigate('/customer/shopping/details', { 
                state: { 
                  toko: tokoLocation, 
                  pengantaran: addresses[addressIndex] 
                } 
              });
            }
          }}
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
