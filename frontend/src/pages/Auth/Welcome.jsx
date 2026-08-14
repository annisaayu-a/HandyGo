import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import logo from '../../assets/logo.png';
import handshakeIcon from '../../assets/hero.png'; // placeholder for handshake
import personIcon from '../../assets/hero.png'; // placeholder for person
import './Welcome.css';

export default function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState('welcome');
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await fetch('https://handygo-api.vercel.app/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        
        if (res.ok) {
          const data = await res.json();
          // Simpan token dan user info di localStorage
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
          
          // Hapus cache service worker agar browser mengambil kode terbaru
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              for(let registration of registrations) {
                registration.unregister();
              } 
            });
          }
          if ('caches' in window) {
            caches.keys().then((keyList) => {
              return Promise.all(keyList.map((key) => caches.delete(key)));
            });
          }

          // Gunakan window.location.href untuk memaksa reload halaman penuh
          window.location.href = '/customer'; 
        } else {
          const errorData = await res.json();
          alert('Login gagal: ' + (errorData.error || 'Terjadi kesalahan'));
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan koneksi');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="welcome-container">
      {step === 'role' && (
        <button  
          className="welcome-back-btn" 
          onClick={() => setStep('welcome')}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </button>
      )}

      {/* Wavy Header Background */}
      <div className="wave-header">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="#034078" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,112C840,85,960,75,1080,85.3C1200,96,1320,128,1380,144L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <div className="welcome-content">
        <div className="logo-section">
          <img src={logo} alt="HandyGo Logo" className="welcome-logo" />
          {step === 'welcome' ? (
            <p className="welcome-tagline">
              Semua kebutuhanmu, dibantu<br />
              dengan cepat, aman, dan<br />
              praktis.
            </p>
          ) : (
            <p className="welcome-tagline role-tagline">
              Ingin menggunakan HandyGo<br />sebagai apa?
            </p>
          )}
        </div>

        {step === 'welcome' ? (
          <>
            <div className="action-buttons">
              <button 
                className="btn-pill btn-solid" 
                onClick={() => setStep('role')}
              >
                Daftar
              </button>
              
              <button 
                className="btn-pill btn-outline" 
                onClick={() => navigate('/login')}
              >
                Masuk
              </button>
            </div>

            <div className="social-login-section">
              <p className="social-text">atau masuk dengan</p>
              
              <div className="social-icons">
                <button className="social-btn" onClick={() => loginWithGoogle()} disabled={isLoading}>
                  {isLoading ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="role-cards-container animate-fade-in">
            <div className="role-card" onClick={() => {
              // Not implemented yet, maybe just alert for now or do nothing
              alert('Pendaftaran Mitra belum tersedia');
            }}>
              <h3 className="role-title">Mitra</h3>
              <div className="role-icon-wrapper">
                <span className="role-emoji">🤝</span>
              </div>
              <p className="role-desc">Terima pesanan dan dapatkan penghasilan</p>
            </div>
            
            <div className="role-card" onClick={() => navigate('/register')}>
              <h3 className="role-title">Pelanggan</h3>
              <div className="role-icon-wrapper">
                <span className="role-emoji">👤</span>
              </div>
              <p className="role-desc">Pesan berbagai layanan sesuai kebutuhan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
