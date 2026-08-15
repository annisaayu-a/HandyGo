import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Heart, TrendingUp, CheckCircle, X } from 'lucide-react';
import './Search.css';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'harga' | 'rating' | null
  const [selectedHarga, setSelectedHarga] = useState(null);
  const [appliedHarga, setAppliedHarga] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [appliedRating, setAppliedRating] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      setIsSearched(true);
    } else {
      setIsSearched(false);
    }
  };

  const handleTrendingClick = (text) => {
    setQuery(text);
    setIsSearched(true);
  };

  const trendingTags = [
    "Belanja bulanan",
    "Titip beli di minimarket",
    "Antar barang hemat",
    "Service hp rusak"
  ];

  const searchResults = [
    {
      id: 6,
      title: 'Samsung Service',
      subtitle: 'Elektronik - Garansi',
      price: '85.000',
      numericPrice: 85000,
      image: '/repair_1.png',
      rating: 5,
      badge: 'Terbaik'
    },
    {
      id: 5,
      title: 'AL service 59',
      subtitle: 'Elektronik - Garansi',
      price: '42.000',
      numericPrice: 42000,
      image: '/repair_2.png',
      rating: 4
    },
    {
      id: 1,
      title: 'Service HP cepat',
      subtitle: 'Semua tipe - Garansi',
      price: '50.000',
      numericPrice: 50000,
      image: '/repair_3.png',
      rating: 4
    },
    {
      id: 2,
      title: 'Suhat Service Elektronik',
      subtitle: 'Hp - Laptop - TV - Part Ori',
      price: '55.000',
      numericPrice: 55000,
      image: '/repair_4.png',
      rating: 3
    }
  ];

  const handleApplyFilter = (type) => {
    if (type === 'harga') {
      setAppliedHarga(selectedHarga);
    } else if (type === 'rating') {
      setAppliedRating(selectedRating);
    }
    setActiveDropdown(null);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const filteredResults = searchResults.filter(item => {
    let matchHarga = true;
    let matchRating = true;
    
    if (appliedHarga) {
      if (appliedHarga === '< 50.000') matchHarga = item.numericPrice < 50000;
      else if (appliedHarga === '< 100.000') matchHarga = item.numericPrice < 100000;
      else if (appliedHarga === '> 100.000') matchHarga = item.numericPrice > 100000;
    }
    
    if (appliedRating) {
      if (appliedRating === '5 bintang') matchRating = item.rating === 5;
      else if (appliedRating === '4 bintang') matchRating = item.rating >= 4;
      else if (appliedRating === '3 bintang') matchRating = item.rating >= 3;
    }
    
    return matchHarga && matchRating;
  });

  return (
    <div className="search-page-container animate-fade-in">
      {showToast && (
        <div className="search-toast">
          <CheckCircle size={20} color="#ffffff" fill="#22c55e" strokeWidth={2.5} />
          <span>Filter berhasil diterapkan.</span>
        </div>
      )}
      
      <div className="search-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <form className="search-input-container" onSubmit={handleSearch}>
          <SearchIcon size={18} color="#94a3b8" />
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === '') {
                setIsSearched(false);
              }
            }}
            placeholder=""
          />
        </form>
      </div>

      {!isSearched ? (
        <div className="trending-section">
          <div className="trending-header">
            <span className="trending-title">Digunakan banyak orang</span>
            <div style={{ backgroundColor: '#034078', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={12} color="#ffffff" />
            </div>
          </div>
          <div className="trending-tags-container">
            {trendingTags.map((tag, idx) => (
              <button 
                key={idx} 
                className="trending-tag"
                onClick={() => handleTrendingClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="search-results-section animate-fade-in">
          <div className="filters-container-wrapper" style={{ position: 'relative' }}>
            <div className="filters-container">
              <button 
                className={`filter-chip ${appliedHarga || activeDropdown === 'harga' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'harga' ? null : 'harga')}
              >
                Harga
              </button>
              <button 
                className={`filter-chip ${appliedRating || activeDropdown === 'rating' ? 'active' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')}
              >
                Rating
              </button>
            </div>

            {activeDropdown === 'harga' && (
              <div className="filter-dropdown animate-fade-in">
                <h4 className="filter-dropdown-title">Harga</h4>
                <div className="filter-options">
                  {['< 50.000', '< 100.000', '> 100.000'].map(option => (
                    <button
                      key={option}
                      className={`filter-option-btn ${selectedHarga === option ? 'selected' : ''}`}
                      onClick={() => setSelectedHarga(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="filter-actions">
                  <button className="filter-btn-outline" onClick={() => setActiveDropdown(null)}>Kembali</button>
                  <button className="filter-btn-primary" onClick={() => handleApplyFilter('harga')}>Terapkan</button>
                </div>
              </div>
            )}

            {activeDropdown === 'rating' && (
              <div className="filter-dropdown animate-fade-in">
                <h4 className="filter-dropdown-title">Rating</h4>
                <div className="filter-options">
                  {['5 bintang', '4 bintang', '3 bintang'].map(option => (
                    <button
                      key={option}
                      className={`filter-option-btn ${selectedRating === option ? 'selected' : ''}`}
                      onClick={() => setSelectedRating(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="filter-actions">
                  <button className="filter-btn-outline" onClick={() => setActiveDropdown(null)}>Kembali</button>
                  <button className="filter-btn-primary" onClick={() => handleApplyFilter('rating')}>Terapkan</button>
                </div>
              </div>
            )}
          </div>

          <div className="results-list">
            {query.toLowerCase().includes('service hp') || query.toLowerCase().includes('servis hp') ? (
              filteredResults.length > 0 ? (
                filteredResults.map(result => (
                  <div key={result.id} className="result-card">
                    <div className="result-image-wrapper">
                      <img src={result.image} alt={result.title} className="result-image" />
                      {result.badge && (
                        <div className="result-badge">{result.badge}</div>
                      )}
                    </div>
                    <div className="result-info">
                      <h3 className="result-title">{result.title}</h3>
                      <p className="result-subtitle">{result.subtitle}</p>
                      <p className="result-price">{result.price}</p>
                    </div>
                    <button className="favorite-btn">
                      <Heart size={18} color="#cbd5e1" fill="#cbd5e1" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state-container">
                  <div className="empty-state-icon">
                    <X size={32} color="#ffffff" strokeWidth={3} />
                  </div>
                  <h3 className="empty-state-title">Hasil tidak ditemukan.</h3>
                  <p className="empty-state-subtitle">
                    Ubah filter yang kamu pakai untuk<br />
                    melihat lebih banyak pilihan.
                  </p>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b' }}>
                <p>Layanan "{query}" saat ini tidak tersedia.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
