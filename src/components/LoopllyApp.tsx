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

  // If user is authenticated, handle post-login flow
  if (authState.isAuthenticated) {
    // Check if user needs OTP verification after login
    if (authState.step === 'otp-verification') {
      console.log('LoopllyApp - Showing OTP verification');
      return <OTPVerification onBack={() => {}} />;
    }
    
    // Check if user needs to complete profile
    if (authState.step === 'profile-setup') {
      console.log('LoopllyApp - Showing profile setup');
      return (
        <MultiStepProfileSetup 
          onBack={() => {}}
          onComplete={() => {}}
        />
      );
    }
    
    // Check if user needs to set communication preferences
    if (authState.step === 'communication-preferences') {
      console.log('LoopllyApp - Showing communication preferences');
      return (
        <CommunicationPreferences 
          onBack={() => {}}
          onComplete={() => {}}
        />
      );
    }
    
    // User has completed all steps, show dashboard
    console.log('LoopllyApp - Showing dashboard');
    return <Dashboard />;
  }

  // Auth screens
  if (authFlow === 'register') {
    console.log('LoopllyApp - Showing register form');
    return (
      <Register
        onBack={() => setAuthFlow('login')}
        onSuccess={() => setAuthFlow('login')}
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