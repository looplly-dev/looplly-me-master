import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SimulatorProvider } from '@/contexts/SimulatorContext';
import { supabase } from '@/integrations/supabase/client';
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
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Wait for simulator session instead of showing login
  console.log('SimulatorApp - Waiting for session');
  return (
    <SimulatorProvider>
      <SimulatorBanner />
      <SessionAwaiter />
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

/**
 * Component to wait for simulator session initialization
 * Polls for session instead of showing login form
 */
function SessionAwaiter() {
  const [status, setStatus] = useState<'waiting' | 'timeout'>('waiting');

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) setStatus('timeout');
    }, 3000);

    const checkSession = async () => {
      for (let i = 0; i < 15; i++) {
        if (!mounted) break;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('SessionAwaiter - Session found, auth will handle redirect');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    };

    checkSession();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  if (status === 'timeout') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Session Timeout:</strong> Couldn't initialize the simulator session.
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to="/admin/simulator">Return to Admin Simulator</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Waiting for simulator session...</h2>
          <p className="text-sm text-muted-foreground">
            Initializing test user authentication
          </p>
        </div>
      </div>
    </div>
  );
}
