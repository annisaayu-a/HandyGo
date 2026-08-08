import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import MitraLayout from '../layouts/MitraLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Welcome from '../pages/Auth/Welcome';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import OTPVerification from '../pages/Auth/OTPVerification';
import CustomerHome from '../pages/Customer/Home';
import CustomerLocation from '../pages/Customer/Location';
import CustomerSearch from '../pages/Customer/Search';
import CustomerProfile from '../pages/Customer/ProfileDetail';
import CustomerHistory from '../pages/Customer/History';
import CustomerMessages from '../pages/Customer/Messages';
import CustomerSettings from '../pages/Customer/Settings';
import ShoppingOrder from '../pages/Customer/ShoppingOrder';
import ShoppingMap from '../pages/Customer/ShoppingMap';
import ShoppingDetails from '../pages/Customer/ShoppingDetails';
import ShoppingCheckout from '../pages/Customer/ShoppingCheckout';
import ShoppingStatus from '../pages/Customer/ShoppingStatus';
import Delivery from '../pages/Customer/Delivery';
import DeliveryLocation from '../pages/Customer/DeliveryLocation';
import DeliveryDetails from '../pages/Customer/DeliveryDetails';
import DeliveryReceiver from '../pages/Customer/DeliveryReceiver';
import DeliverySender from '../pages/Customer/DeliverySender';
import DeliveryCheckout from '../pages/Customer/DeliveryCheckout';
import DeliveryStatus from '../pages/Customer/DeliveryStatus';
import DeliveryMap from '../pages/Customer/DeliveryMap';
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
  {
    path: '/otp-verification',
    element: <OTPVerification />,
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
        path: 'location',
        element: <CustomerLocation />,
      },
      {
        path: 'search',
        element: <CustomerSearch />,
      },
      {
        path: 'history',
        element: <CustomerHistory />,
      },
      {
        path: 'messages',
        element: <CustomerMessages />,
      },
      {
        path: 'settings',
        element: <CustomerSettings />,
      },
      {
        path: 'profile',
        element: <CustomerProfile />,
      },
      {
        path: 'shopping',
        element: <ShoppingOrder />,
      },
      {
        path: 'shopping/map',
        element: <ShoppingMap />,
      },
      {
        path: 'shopping/details',
        element: <ShoppingDetails />,
      },
      {
        path: 'shopping/checkout',
        element: <ShoppingCheckout />,
      },
      {
        path: 'shopping/status',
        element: <ShoppingStatus />,
      },
      {
        path: 'delivery',
        element: <Delivery />,
      },
      {
        path: 'delivery/location',
        element: <DeliveryLocation />,
      },
      {
        path: 'delivery/details',
        element: <DeliveryDetails />,
      },
      {
        path: 'delivery/receiver',
        element: <DeliveryReceiver />,
      },
      {
        path: 'delivery/sender',
        element: <DeliverySender />,
      },
      {
        path: 'delivery/checkout',
        element: <DeliveryCheckout />,
      },
      {
        path: 'delivery/status',
        element: <DeliveryStatus />,
      },
      {
        path: 'delivery/map',
        element: <DeliveryMap />,
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
