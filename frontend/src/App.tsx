import { lazy, Suspense, useEffect } from 'react';
import { GooeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { AppLayout } from './components/layout/AppLayout';
import { PWAUpdateToast } from './components/ui/PWAUpdateToast';
import { InstallBanner } from './components/ui/InstallBanner';

const PrivateRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Clients = lazy(() => import('./pages/Clients').then((m) => ({ default: m.Clients })));
const ClientDetails = lazy(() => import('./pages/ClientDetails').then((m) => ({ default: m.ClientDetails })));
const Appointments = lazy(() => import('./pages/Appointments').then((m) => ({ default: m.Appointments })));
const ConsentForm = lazy(() => import('./pages/ConsentForm').then((m) => ({ default: m.ConsentForm })));
const BookingPage = lazy(() => import('./pages/BookingPage').then((m) => ({ default: m.BookingPage })));
const BookingRequests = lazy(() => import('./pages/BookingRequests').then((m) => ({ default: m.BookingRequests })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));
const Billing = lazy(() => import('./pages/Billing').then((m) => ({ default: m.Billing })));
const ClientPortal = lazy(() => import('./pages/ClientPortal').then((m) => ({ default: m.ClientPortal })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then((m) => ({ default: m.VerifyEmail })));

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <GooeyToaster position="bottom-right" theme="dark" />
      <PWAUpdateToast />
      <InstallBanner />
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/book/:artistId" element={<BookingPage />} />
            <Route path="/portal/:token" element={<ClientPortal />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<AppLayout />}>
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
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
