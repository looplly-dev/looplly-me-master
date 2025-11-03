import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Login from './auth/Login';
import Register from './auth/Register';

import CommunicationPreferences from './auth/CommunicationPreferences';
import ForgotPassword from './auth/ForgotPassword';
import Earn from '@/pages/Earn';
import Wallet from '@/pages/Wallet';
import Profile from '@/pages/Profile';
import ProfileComplete from '@/pages/ProfileComplete';
import Refer from '@/pages/Refer';
import Community from '@/pages/Community';
import Rep from '@/pages/Rep';
import Settings from '@/pages/Settings';
import Support from '@/pages/Support';

export default function LoopllyApp() {
  const [authFlow, setAuthFlow] = useState<'login' | 'register' | 'forgot' | 'profile' | 'communication' | 'otp'>('login');
  const [justCompletedProfile, setJustCompletedProfile] = useState(false);
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

  // If user is authenticated, handle post-login flow
  if (authState.isAuthenticated) {
    
    // Profile setup now happens in-dashboard via Level2ProfileModal
    // Skip profile-setup step and go directly to dashboard
    
    // User has completed all steps, show dashboard routes
    console.log('LoopllyApp - Showing dashboard routes');
    return (
      <Routes>
        <Route path="/" element={<Earn />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/complete" element={<ProfileComplete />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/community" element={<Community />} />
        <Route path="/rep" element={<Rep />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Auth screens
  if (authFlow === 'register') {
    console.log('LoopllyApp - Showing register form');
    return (
      <Register
        onBack={() => setAuthFlow('login')}
        onSuccess={() => setAuthFlow('login')}
        onOTPRequired={() => setAuthFlow('login')}
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
