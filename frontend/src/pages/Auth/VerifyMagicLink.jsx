import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyMagicLink = () => {
  const [status, setStatus] = useState('Memverifikasi tautan...');
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
        
        // Save user data and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setStatus('Verifikasi berhasil! Mengalihkan...');
        
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          HandyGo
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyMagicLink;
