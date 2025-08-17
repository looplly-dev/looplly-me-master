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

  console.log('LoopllyApp - Current authState:', authState);
  console.log('LoopllyApp - Current authFlow:', authFlow);

  // Show loading spinner while checking auth state
  if (authState.isLoading) {
    console.log('LoopllyApp - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin login check (simple demo)
  if (isAdmin) {
    console.log('LoopllyApp - Showing admin panel');
    return <AdminPanel />;
  }

  // Handle admin route
  if (window.location.pathname === '/admin') {
    console.log('LoopllyApp - Admin route detected');
    return <AdminPanel />;
  }

  // If user is authenticated and has completed profile, show dashboard
  if (authState.isAuthenticated && authState.step === 'dashboard') {
    console.log('LoopllyApp - Showing dashboard');
    return <Dashboard />;
  }

  // Multi-step onboarding flow
  if (authState.step === 'profile' || authFlow === 'profile') {
    console.log('LoopllyApp - Showing profile setup');
    return (
      <MultiStepProfileSetup 
        onBack={() => setAuthFlow('login')}
        onComplete={() => setAuthFlow('communication')}
      />
    );
  }

  if (authFlow === 'communication') {
    console.log('LoopllyApp - Showing communication preferences');
    return (
      <CommunicationPreferences 
        onBack={() => setAuthFlow('profile')}
        onComplete={() => setAuthFlow('otp')}
      />
    );
  }

  // If user needs OTP verification
  if (authState.step === 'otp' || authFlow === 'otp') {
    console.log('LoopllyApp - Showing OTP verification');
    return <OTPVerification onBack={() => setAuthFlow('communication')} />;
  }

  // Auth screens
  if (authFlow === 'register') {
    console.log('LoopllyApp - Showing register form');
    return (
      <Register
        onBack={() => setAuthFlow('login')}
        onSuccess={() => setAuthFlow('profile')}
      />
    );
  }

  if (authFlow === 'forgot') {
    console.log('LoopllyApp - Showing forgot password');
    return <ForgotPassword onBack={() => setAuthFlow('login')} />;
  }

  console.log('LoopllyApp - Showing login form');
  return (
    <Login
      onForgotPassword={() => setAuthFlow('forgot')}
      onRegister={() => setAuthFlow('register')}
    />
  );
}