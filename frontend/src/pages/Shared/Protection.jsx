import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, FileText, CreditCard, Users, HelpCircle, MessageCircle } from 'lucide-react';
import './Protection.css';

export default function Protection() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMitra = location.pathname.startsWith('/mitra');
  const backPath = isMitra ? '/mitra/profile' : '/customer/settings';
  const helpPath = isMitra ? '/mitra/help' : '/customer/help';

  const items = [
    {
      icon: <Lock size={22} color="#034078" />,
      title: 'Akunmu',
      desc: 'Kami membantu melindungi akunmu dari akses yang tidak sah',
    },
    {
      icon: <FileText size={22} color="#034078" />,
      title: 'Data Pribadi',
      desc: 'Data pribadi digunakan hanya untuk mendukung layanan dan kebutuhan aplikasi',
    },
    {
      icon: <CreditCard size={22} color="#034078" />,
      title: 'Transaksi',
      desc: 'Setiap transaksi dicatat agar kamu dapat melihat dan memantau aktivitas pesananmu',
    },
    {
      icon: <Users size={22} color="#034078" />,
      title: 'Mitra dan Pelanggan',
      desc: 'Kami melakukan proses verifikasi untuk membantu menciptakan lingkungan layanan yang lebih terpercaya',
    },
    {
      icon: <HelpCircle size={22} color="#034078" />,
      title: 'Bantuan?',
      desc: 'Laporkan kendala atau aktivitas mencurigakan kepada tim HandyGo',
    },
  ];

  return (
    <div className="protection-container animate-fade-in">
      <div className="protection-header">
        <button className="protection-back-btn" onClick={() => navigate(backPath)}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <h1 className="protection-title">Perlindungan</h1>
      </div>

      <div className="protection-content">
        {/* Shield Icon */}
        <div className="protection-shield-wrap">
          <div className="protection-shield">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <path d="M36 6L10 18V36C10 51.46 21.12 65.94 36 69.6C50.88 65.94 62 51.46 62 36V18L36 6Z" fill="#16a34a" />
              <path d="M28 36l6 6 12-12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h2 className="protection-headline">Perlindunganmu di HandyGo</h2>
        <p className="protection-subtitle">
          Kami berkomitmen memberikan pengalaman yang aman dan nyaman selama kamu menggunakan HandyGo.
        </p>

        {/* Items */}
        <div className="protection-items">
          {items.map((item, idx) => (
            <div key={idx} className="protection-item">
              <div className="protection-item-icon">{item.icon}</div>
              <div className="protection-item-text">
                <h3 className="protection-item-title">{item.title}</h3>
                <p className="protection-item-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Butuh Bantuan Button */}
      <div className="protection-bottom">
        <button className="protection-help-btn" onClick={() => navigate(helpPath)}>
          <MessageCircle size={18} color="#034078" />
          Butuh bantuan?
        </button>
      </div>
    </div>
  );
}
