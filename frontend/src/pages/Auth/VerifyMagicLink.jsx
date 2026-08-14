import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Login.css'; // Use existing login styles for consistency

const VerifyMagicLink = () => {
  const [status, setStatus] = useState('Verifikasi sedang diproses...');
  const [isSuccess, setIsSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setStatus('Token tidak valid atau tidak ditemukan.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('https://handygo-api.vercel.app/api/auth/verify-magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Tautan sudah kedaluwarsa atau tidak valid.');
        }
        
        // Save user data and token matching the rest of the app's keys
        const userObj = { 
          name: data.user.full_name, 
          email: data.user.email, 
          phone: data.user.phone_number, 
          id: data.user.id,
          default_location: data.user.default_location,
          profile_picture: data.user.profile_picture
        };
        localStorage.setItem('handyGoToken', data.token);
        localStorage.setItem('handyGoUser', JSON.stringify(userObj));

        setIsSuccess(true);
        setStatus('Verifikasi berhasil!');
        
        setTimeout(() => {
          navigate('/customer');
        }, 2000);
      } catch (error) {
        console.error('Verify error:', error);
        setStatus('Verifikasi gagal. Tautan mungkin kedaluwarsa.');
      }
    };

    verifyToken();
  }, [location, navigate]);

  return (
    <div className="login-container">
      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <div className="login-content animate-fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <img 
          src={logo} 
          alt="HandyGo" 
          style={{ width: '120px', height: 'auto', margin: '0 auto 2rem auto', display: 'block' }} 
        />
        
        {!isSuccess && status.includes('diproses') && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg className="h-12 w-12 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#0ea5e9" strokeWidth="4"></circle>
              <path className="opacity-75" fill="#0ea5e9" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {isSuccess && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '50%' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        )}

        <h1 className="login-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: isSuccess ? '#16a34a' : '#1e293b' }}>
          {status}
        </h1>

        {isSuccess && (
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Mengalihkan ke halaman utama...
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyMagicLink;
