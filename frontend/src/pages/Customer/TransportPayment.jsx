import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Circle } from 'lucide-react';
import { FaMoneyBillWave, FaQrcode } from 'react-icons/fa';
import './TransportPayment.css';

export default function TransportPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve passed state or set defaults
  const stateData = location.state || {};
  const currentMethod = stateData.paymentMethod || 'Tunai';
  
  const [selectedMethod, setSelectedMethod] = useState(currentMethod);

  const paymentMethods = [
    { id: 'Tunai', name: 'Tunai', icon: <FaMoneyBillWave size={20} color="#94a3b8" /> },
    { id: 'QRIS', name: 'QRIS', icon: <FaQrcode size={20} color="#94a3b8" /> }
  ];

  const handleConfirm = () => {
    // Navigate back to details with selected payment method
    navigate('/customer/transport/details', { 
      state: { 
        ...stateData,
        paymentMethod: selectedMethod 
      } 
    });
  };

  return (
    <div className="transport-payment-page animate-fade-in">
      <header className="payment-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="header-title">Metode Pembayaran</h1>
      </header>

      <div className="payment-content">
        <h2 className="payment-subtitle">Pilih Metode Pembayaran</h2>
        
        <div className="payment-options">
          {paymentMethods.map(method => (
            <div 
              key={method.id}
              className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="method-icon-wrapper">
                {method.icon}
              </div>
              <span className="method-name">{method.name}</span>
              
              <div className="method-radio">
                {selectedMethod === method.id ? (
                  <div className="radio-checked">
                    <Check size={14} color="white" />
                  </div>
                ) : (
                  <Circle size={20} color="#cbd5e1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="payment-bottom-action">
        <button className="confirm-btn" onClick={handleConfirm}>
          Konfirmasi
        </button>
      </div>
    </div>
  );
}
