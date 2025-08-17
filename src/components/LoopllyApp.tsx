import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Login from './auth/Login';
import Register from './auth/Register';
import OTPVerification from './auth/OTPVerification';
import ProfileSetup from './auth/ProfileSetup';
import Dashboard from './dashboard/Dashboard';
import ForgotPassword from './auth/ForgotPassword';
import AdminPanel from './admin/AdminPanel';

export default function LoopllyApp() {
  const [authFlow, setAuthFlow] = useState<'login' | 'register' | 'forgot'>('login');
  const [isAdmin, setIsAdmin] = useState(false);
  const { authState } = useAuth();

  // Admin login check (simple demo)
  if (isAdmin) {
    return <AdminPanel />;
  }

  // Handle admin route
  if (window.location.pathname === '/admin') {
    return <AdminPanel />;
  }

  // Auth flow based on user state
  if (authState.isAuthenticated && authState.step === 'dashboard') {
    return <Dashboard />;
  }

  if (authState.step === 'otp') {
    return <OTPVerification onBack={() => setAuthFlow('login')} />;
  }

  if (authState.step === 'profile') {
    return <ProfileSetup />;
  }

  // Auth screens
  if (authFlow === 'register') {
    return (
      <Register
        onBack={() => setAuthFlow('login')}
        onSuccess={() => setAuthFlow('login')}
      />
    );
  }

  if (authFlow === 'forgot') {
    return <ForgotPassword onBack={() => setAuthFlow('login')} />;
  }

  return (
    <Login
      onForgotPassword={() => setAuthFlow('forgot')}
      onRegister={() => setAuthFlow('register')}
    />
  );
}