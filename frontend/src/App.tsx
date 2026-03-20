import { useEffect } from 'react';
import { GooeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { AppLayout } from './components/layout/AppLayout';

const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
};
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientDetails } from './pages/ClientDetails';
import { Appointments } from './pages/Appointments';
import { ConsentForm } from './pages/ConsentForm';
import { BookingPage } from './pages/BookingPage';
import { BookingRequests } from './pages/BookingRequests';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Billing } from './pages/Billing';
import { ClientPortal } from './pages/ClientPortal';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <GooeyToaster position="bottom-right" theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book/:artistId" element={<BookingPage />} />
          <Route path="/portal/:token" element={<ClientPortal />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetails />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="booking-requests" element={<BookingRequests />} />
              <Route path="consent/:appointmentId" element={<ConsentForm />} />
              <Route path="profile" element={<Profile />} />
              <Route path="billing" element={<Billing />} />
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
