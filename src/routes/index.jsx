import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import MitraLayout from '../layouts/MitraLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Welcome from '../pages/Auth/Welcome';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import CustomerHome from '../pages/Customer/Home';
import MitraDashboard from '../pages/Mitra/Dashboard';
import AdminDashboard from '../pages/Admin/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  // Customer Routes
  {
    path: '/customer',
    element: <CustomerLayout />,
    children: [
      {
        path: '',
        element: <CustomerHome />,
      },
      {
        path: 'orders',
        element: <div>Halaman Pesanan Saya (Placeholder)</div>,
      },
      {
        path: 'profile',
        element: <div>Halaman Profil Customer (Placeholder)</div>,
      },
    ],
  },
  // Mitra Routes
  {
    path: '/mitra',
    element: <MitraLayout />,
    children: [
      {
        path: '',
        element: <MitraDashboard />,
      },
      {
        path: 'jobs',
        element: <div>Halaman Pekerjaan Tersedia (Placeholder)</div>,
      },
      {
        path: 'profile',
        element: <div>Halaman Profil Mitra (Placeholder)</div>,
      },
    ],
  },
  // Admin Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <AdminDashboard />,
      },
      {
        path: 'customers',
        element: <div>Data Customer (Placeholder)</div>,
      },
      {
        path: 'mitras',
        element: <div>Data Mitra (Placeholder)</div>,
      },
    ],
  },
  // 404
  {
    path: '*',
    element: (
      <div style={{ padding: '24px', textAlign: 'center', marginTop: '100px' }}>
        <h2>404 - Halaman tidak ditemukan</h2>
        <a href="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Kembali ke Awal</a>
      </div>
    ),
  }
]);
