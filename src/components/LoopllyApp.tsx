import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Login from './auth/Login';
import Register from './auth/Register';
import OTPVerification from './auth/OTPVerification';
import ProfileSetup from './auth/ProfileSetup';
import MultiStepProfileSetup from './auth/MultiStepProfileSetup';
import CommunicationPreferences from './auth/CommunicationPreferences';
import Dashboard from './dashboard/Dashboard';
import ForgotPassword from './auth/ForgotPassword';
import AdminPanel from './admin/AdminPanel';

export default function LoopllyApp() {
  const [authFlow, setAuthFlow] = useState<'login' | 'register' | 'forgot' | 'profile' | 'communication' | 'otp'>('login');
  const [isAdmin, setIsAdmin] = useState(false);
  const { authState } = useAuth();

  // Show loading spinner while checking auth state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin login check (simple demo)
  if (isAdmin) {
    return <AdminPanel />;
  }

  // Handle admin route
  if (window.location.pathname === '/admin') {
    return <AdminPanel />;
  }

  // If user is authenticated and has completed profile, show dashboard
  if (authState.isAuthenticated && authState.step === 'dashboard') {
    return <Dashboard />;
  }

  // Multi-step onboarding flow
  if (authState.step === 'profile' || authFlow === 'profile') {
    return (
      <MultiStepProfileSetup 
        onBack={() => setAuthFlow('login')}
        onComplete={() => setAuthFlow('communication')}
      />
    );
  }

  if (authFlow === 'communication') {
    return (
      <CommunicationPreferences 
        onBack={() => setAuthFlow('profile')}
        onComplete={() => setAuthFlow('otp')}
      />
    );
  }

  // If user needs OTP verification
  if (authState.step === 'otp' || authFlow === 'otp') {
    return <OTPVerification onBack={() => setAuthFlow('communication')} />;
  }

  // Auth screens
  if (authFlow === 'register') {
    return (
      <Register
        onBack={() => setAuthFlow('login')}
        onSuccess={() => setAuthFlow('profile')}
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