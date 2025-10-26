import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SimulatorProvider } from '@/contexts/SimulatorContext';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import OTPVerification from '@/components/auth/OTPVerification';
import MultiStepProfileSetup from '@/components/auth/MultiStepProfileSetup';
import CommunicationPreferences from '@/components/auth/CommunicationPreferences';
import ForgotPassword from '@/components/auth/ForgotPassword';
import Earn from '@/pages/Earn';
import Wallet from '@/pages/Wallet';
import Profile from '@/pages/Profile';
import Refer from '@/pages/Refer';
import Community from '@/pages/Community';
import Rep from '@/pages/Rep';
import Settings from '@/pages/Settings';
import Support from '@/pages/Support';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * SimulatorApp - Isolated routing for test user sessions
 * 
 * Key differences from LoopllyApp:
 * - No ProtectedRoute wrappers
 * - Visual simulator mode indicator
 * - Routes directly render components without permission checks
 * - Wrapped in SimulatorProvider context
 * 
 * Security: Permission checks happen at session creation (create-simulator-session edge function)
 * Only authorized admins can create test sessions, and only for is_test_account=true users
 */
export default function SimulatorApp() {
  const [authFlow, setAuthFlow] = useState<'login' | 'register' | 'forgot' | 'profile' | 'communication' | 'otp'>('login');
  const [justCompletedProfile, setJustCompletedProfile] = useState(false);
  const { authState } = useAuth();

  console.log('SimulatorApp - Current authState:', authState);
  console.log('SimulatorApp - Current authFlow:', authFlow);

  // Show loading spinner while checking auth state
  if (authState.isLoading) {
    console.log('SimulatorApp - Showing loading state');
    return (
      <SimulatorProvider>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SimulatorProvider>
    );
  }

  // If user is authenticated, handle post-login flow
  if (authState.isAuthenticated) {
    // Check if user needs OTP verification after login
    if (authState.step === 'otp-verification') {
      console.log('SimulatorApp - Showing OTP verification');
      return (
        <SimulatorProvider>
          <SimulatorBanner />
          <OTPVerification onBack={() => {}} onSuccess={() => {}} />
        </SimulatorProvider>
      );
    }
    
    // Check if user needs to complete profile
    if (authState.step === 'profile-setup') {
      console.log('SimulatorApp - Showing profile setup');
      return (
        <SimulatorProvider>
          <SimulatorBanner />
          <MultiStepProfileSetup 
            onBack={() => {}}
            onComplete={() => {
              setJustCompletedProfile(true);
            }}
          />
        </SimulatorProvider>
      );
    }
    
    // Check if user needs to set communication preferences
    if (authState.step === 'communication-preferences') {
      console.log('SimulatorApp - Showing communication preferences');
      return (
        <SimulatorProvider>
          <SimulatorBanner />
          <CommunicationPreferences 
            onBack={() => {}}
            onComplete={() => {}}
          />
        </SimulatorProvider>
      );
    }
    
    // User has completed all steps, show dashboard routes
    console.log('SimulatorApp - Showing dashboard routes');
    return (
      <SimulatorProvider>
        <SimulatorBanner />
        <Routes>
          <Route path="/dashboard" element={<Earn />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/refer" element={<Refer />} />
          <Route path="/community" element={<Community />} />
          <Route path="/rep" element={<Rep />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<Navigate to="/simulator/dashboard" replace />} />
        </Routes>
      </SimulatorProvider>
    );
  }

  // Auth screens
  if (authFlow === 'register') {
    console.log('SimulatorApp - Showing register form');
    return (
      <SimulatorProvider>
        <SimulatorBanner />
        <Register
          onBack={() => setAuthFlow('login')}
          onSuccess={() => setAuthFlow('login')}
          onOTPRequired={() => setAuthFlow('login')}
        />
      </SimulatorProvider>
    );
  }

  if (authFlow === 'forgot') {
    console.log('SimulatorApp - Showing forgot password');
    return (
      <SimulatorProvider>
        <SimulatorBanner />
        <ForgotPassword onBack={() => setAuthFlow('login')} />
      </SimulatorProvider>
    );
  }

  console.log('SimulatorApp - Showing login form');
  return (
    <SimulatorProvider>
      <SimulatorBanner />
      <Login
        onForgotPassword={() => setAuthFlow('forgot')}
        onRegister={() => setAuthFlow('register')}
      />
    </SimulatorProvider>
  );
}

/**
 * Visual indicator showing simulator mode is active
 */
function SimulatorBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white">
      <Alert className="rounded-none border-0 bg-orange-500 text-white">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-white">
          <strong>SIMULATOR MODE:</strong> You are testing as a simulated user. All actions affect test data only.
        </AlertDescription>
      </Alert>
    </div>
  );
}
