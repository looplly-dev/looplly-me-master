import { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isPreview } from '@/utils/runtimeEnv';
import Login from './auth/Login';
import Register from './auth/Register';
import CommunicationPreferences from './auth/CommunicationPreferences';
import ForgotPassword from './auth/ForgotPassword';
import Earn from '@/pages/Earn';

// Lazy load secondary user-facing pages
const Wallet = lazy(() => import('@/pages/Wallet'));
const Profile = lazy(() => import('@/pages/Profile'));
const ProfileComplete = lazy(() => import('@/pages/ProfileComplete'));
const Refer = lazy(() => import('@/pages/Refer'));
const Community = lazy(() => import('@/pages/Community'));
const Rep = lazy(() => import('@/pages/Rep'));
const Settings = lazy(() => import('@/pages/Settings'));
const Support = lazy(() => import('@/pages/Support'));

export default function LoopllyApp() {
  const [authFlow, setAuthFlow] = useState<'login' | 'register' | 'forgot' | 'profile' | 'communication' | 'otp'>('login');
  const [justCompletedProfile, setJustCompletedProfile] = useState(false);
  const { authState } = useAuth();

  if (import.meta.env.DEV && !isPreview()) {
    console.log('LoopllyApp - Current authState:', authState);
    console.log('LoopllyApp - Current authFlow:', authFlow);
  }

  // Show loading spinner while checking auth state
  if (authState.isLoading) {
    if (import.meta.env.DEV && !isPreview()) {
      console.log('LoopllyApp - Showing loading state');
    }
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
    if (import.meta.env.DEV && !isPreview()) {
      console.log('LoopllyApp - Showing dashboard routes');
    }
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Earn />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/complete" element={<ProfileComplete />} />
          <Route path="/refer" element={<Refer />} />
          <Route path="/community" element={<Community />} />
          <Route path="/rep" element={<Rep />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Auth screens
  if (authFlow === 'register') {
    if (import.meta.env.DEV && !isPreview()) {
      console.log('LoopllyApp - Showing register form');
    }
    return (
      <Register
        onBack={() => setAuthFlow('login')}
        onSuccess={() => setAuthFlow('login')}
        onOTPRequired={() => setAuthFlow('login')}
      />
    );
  }

  if (authFlow === 'forgot') {
    if (import.meta.env.DEV && !isPreview()) {
      console.log('LoopllyApp - Showing forgot password');
    }
    return <ForgotPassword onBack={() => setAuthFlow('login')} />;
  }

  if (import.meta.env.DEV && !isPreview()) {
    console.log('LoopllyApp - Showing login form');
  }
  return (
    <Login
      onForgotPassword={() => setAuthFlow('forgot')}
      onRegister={() => setAuthFlow('register')}
    />
  );
}
