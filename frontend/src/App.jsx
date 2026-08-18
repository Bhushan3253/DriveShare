import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layout & Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import SplashScreen from './components/SplashScreen';
import AdminSidebar from './components/AdminSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import CarList from './pages/renter/CarList';
import CarDetails from './pages/renter/CarDetails';

// Renter Pages
import Booking from './pages/renter/Booking';
import Payment from './pages/renter/Payment';
import SubmitUTR from './pages/renter/SubmitUTR';
import MyBookings from './pages/renter/MyBookings';
import ReviewForm from './pages/renter/ReviewForm';
import Profile from './pages/renter/Profile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddCar from './pages/owner/AddCar';
import MyCars from './pages/owner/MyCars';
import EditCar from './pages/owner/EditCar';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerEarnings from './pages/owner/OwnerEarnings';
import OwnerProfile from './pages/owner/OwnerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCars from './pages/admin/AdminCars';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUTR from './pages/admin/AdminUTR';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminReviews from './pages/admin/AdminReviews';

// Standard Marketplace Layout
const StandardLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

// Admin Console Layout with Sidebar
const AdminLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash screen on first visit / app boot
    return !sessionStorage.getItem('driveshare_splash_shown');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('driveshare_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <Routes>
        {/* 1. Public & Renter / Owner Routes in Standard Layout */}
        <Route element={<StandardLayout />}>
          <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/cars" element={<CarList />} />
        <Route path="/cars/:id" element={<CarDetails />} />

        {/* Protected Renter Flow */}
        <Route
          path="/booking/:bookingId"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId/utr"
          element={
            <ProtectedRoute>
              <SubmitUTR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews/:bookingId"
          element={
            <ProtectedRoute>
              <ReviewForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected Owner Flow */}
        <Route
          path="/owner"
          element={
            <RoleRoute role="OWNER">
              <OwnerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/cars"
          element={
            <RoleRoute role="OWNER">
              <MyCars />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/cars/add"
          element={
            <RoleRoute role="OWNER">
              <AddCar />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/cars/:id/edit"
          element={
            <RoleRoute role="OWNER">
              <EditCar />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/bookings"
          element={
            <RoleRoute role="OWNER">
              <OwnerBookings />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/earnings"
          element={
            <RoleRoute role="OWNER">
              <OwnerEarnings />
            </RoleRoute>
          }
        />
        <Route
          path="/owner/profile"
          element={
            <RoleRoute role="OWNER">
              <OwnerProfile />
            </RoleRoute>
          }
        />
      </Route>

      {/* 2. Protected Admin Console with Sidebar Layout */}
      <Route
        path="/admin"
        element={
          <RoleRoute role="ADMIN">
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="cars" element={<AdminCars />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="utr" element={<AdminUTR />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
