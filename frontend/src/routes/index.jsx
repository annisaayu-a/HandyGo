import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import MitraLayout from '../layouts/MitraLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Welcome from '../pages/Auth/Welcome';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import PartnerAuthOption from '../pages/Auth/PartnerAuthOption';
import PartnerLogin from '../pages/Auth/PartnerLogin';
import PartnerWelcome from '../pages/Auth/PartnerWelcome';
import PartnerRegister from '../pages/Auth/PartnerRegister';
import PartnerLocation from '../pages/Auth/PartnerLocation';
import PartnerVehicle from '../pages/Auth/PartnerVehicle';
import PartnerData from '../pages/Auth/PartnerData';
import PartnerUpload from '../pages/Auth/PartnerUpload';
import PartnerCamera from '../pages/Auth/PartnerCamera';
import PartnerSTNK from '../pages/Auth/PartnerSTNK';
import PartnerSuccess from '../pages/Auth/PartnerSuccess';
import PartnerStatus from '../pages/Auth/PartnerStatus';
import OTPVerification from '../pages/Auth/OTPVerification';
import VerifyMagicLink from '../pages/Auth/VerifyMagicLink';
import CustomerHome from '../pages/Customer/Home';
import CustomerLocation from '../pages/Customer/Location';
import SearchLocation from '../pages/Customer/SearchLocation';
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
import ShoppingPayment from '../pages/Customer/ShoppingPayment';
import ShoppingLocation from '../pages/Customer/ShoppingLocation';
import Delivery from '../pages/Customer/Delivery';
import DeliveryLocation from '../pages/Customer/DeliveryLocation';
import DeliveryDetails from '../pages/Customer/DeliveryDetails';
import DeliveryReceiver from '../pages/Customer/DeliveryReceiver';
import DeliverySender from '../pages/Customer/DeliverySender';
import DeliveryCheckout from '../pages/Customer/DeliveryCheckout';
import DeliveryStatus from '../pages/Customer/DeliveryStatus';
import DeliveryMap from '../pages/Customer/DeliveryMap';
import Cleaning from '../pages/Customer/Cleaning';
import CleaningMap from '../pages/Customer/CleaningMap';
import CleaningCheckout from '../pages/Customer/CleaningCheckout';
import CleaningStatus from '../pages/Customer/CleaningStatus';
import CleaningPayment from '../pages/Customer/CleaningPayment';
import Repair from '../pages/Customer/Repair';
import RepairMap from '../pages/Customer/RepairMap';
import RepairCheckout from '../pages/Customer/RepairCheckout';
import RepairDetails from '../pages/Customer/RepairDetails';
import RepairStatus from '../pages/Customer/RepairStatus';
import RepairPayment from '../pages/Customer/RepairPayment';
import Transport from '../pages/Customer/Transport';
import TransportLocation from '../pages/Customer/TransportLocation';
import TransportMap from '../pages/Customer/TransportMap';
import TransportDetails from '../pages/Customer/TransportDetails';
import TransportPayment from '../pages/Customer/TransportPayment';
import TransportQris from '../pages/Customer/TransportQris';
import Chat from '../pages/Customer/Chat';
import ChatList from '../pages/Customer/ChatList';
import Call from '../pages/Customer/Call';
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
    path: '/partner-auth-option',
    element: <PartnerAuthOption />,
  },
  {
    path: '/partner-login',
    element: <PartnerLogin />,
  },
  {
    path: '/partner-welcome',
    element: <PartnerWelcome />,
  },
  {
    path: '/partner-register',
    element: <PartnerRegister />,
  },
  {
    path: '/partner-location',
    element: <PartnerLocation />,
  },
  {
    path: '/partner-vehicle',
    element: <PartnerVehicle />,
  },
  {
    path: '/partner-data',
    element: <PartnerData />,
  },
  {
    path: '/partner-upload',
    element: <PartnerUpload />,
  },
  {
    path: '/partner-camera',
    element: <PartnerCamera />,
  },
  {
    path: '/partner-stnk',
    element: <PartnerSTNK />,
  },
  {
    path: '/partner-success',
    element: <PartnerSuccess />,
  },
  {
    path: '/partner-status',
    element: <PartnerStatus />,
  },
  {
    path: '/otp-verification',
    element: <OTPVerification />,
  },
  {
    path: '/verify-magic-link',
    element: <VerifyMagicLink />,
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
        path: 'search-location',
        element: <SearchLocation />,
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
        path: 'shopping/location',
        element: <ShoppingLocation />,
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
        path: 'shopping/payment',
        element: <ShoppingPayment />,
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
      {
        path: 'cleaning',
        element: <Cleaning />,
      },
      {
        path: 'cleaning/map',
        element: <CleaningMap />,
      },
      {
        path: 'cleaning/checkout',
        element: <CleaningCheckout />,
      },
      {
        path: 'cleaning/status',
        element: <CleaningStatus />,
      },
      {
        path: 'cleaning/payment',
        element: <CleaningPayment />,
      },
      {
        path: 'repair',
        element: <Repair />,
      },
      {
        path: 'repair/map',
        element: <RepairMap />,
      },
      {
        path: 'repair/checkout',
        element: <RepairCheckout />,
      },
      {
        path: 'repair/details',
        element: <RepairDetails />,
      },
      {
        path: 'repair/status',
        element: <RepairStatus />,
      },
      {
        path: 'repair/payment',
        element: <RepairPayment />,
      },
      {
        path: 'transport',
        element: <Transport />,
      },
      {
        path: 'transport/location',
        element: <TransportLocation />,
      },
      {
        path: 'transport/map',
        element: <TransportMap />,
      },
      {
        path: 'transport/details',
        element: <TransportDetails />,
      },
      {
        path: 'transport/payment',
        element: <TransportPayment />,
      },
      {
        path: 'transport/qris',
        element: <TransportQris />,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
      {
        path: 'messages',
        element: <ChatList />,
      },
      {
        path: 'call',
        element: <Call />,
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
