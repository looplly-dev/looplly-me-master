import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SimulatorProvider } from '@/contexts/SimulatorContext';
import { simulatorClient as supabase } from '@/integrations/supabase/simulatorClient';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';

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
    // Check if we should show registration form for this stage
    const simulatorStage = sessionStorage.getItem('simulator_stage');
    const shouldShowRegistration = simulatorStage === 'fresh_signup' || simulatorStage === 'basic_profile';
    
    // GUARD: Prevent authenticated users from seeing /simulator/register
    // UNLESS they're in a stage that requires the registration UI
    if (window.location.pathname === '/simulator/register') {
      if (!shouldShowRegistration) {
        console.log('SimulatorApp - Redirecting authenticated user from /register to /dashboard (stage does not require registration UI)');
        return (
          <SimulatorProvider>
            <SimulatorBanner />
            <Navigate to="/simulator/dashboard" replace />
          </SimulatorProvider>
        );
      } else {
        console.log('SimulatorApp - Allowing access to registration form (stage requires registration UI)');
        // Fall through to render the registration route below
      }
    }
    
    // Profile setup now happens in-dashboard via Level2ProfileModal
    // Skip profile-setup step and go directly to dashboard
    
    // User has completed all steps, show dashboard routes
    console.log('SimulatorApp - Showing dashboard routes');
    return (
      <SimulatorProvider>
        <SimulatorBanner />
        <Routes>
          <Route path="/register" element={
            <Register
              onBack={() => window.location.href = '/admin/simulator'}
              onSuccess={() => window.location.href = '/simulator/dashboard'}
              onOTPRequired={() => {}} 
            />
          } />
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
  const [userInfo, setUserInfo] = useState<{ name: string; mobile: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Try to get user info from sessionStorage
    const simulatorUser = sessionStorage.getItem('simulator_user');
    if (simulatorUser) {
      try {
        const user = JSON.parse(simulatorUser);
        setUserInfo({
          name: user.name || 'Unknown User',
          mobile: user.mobile_number || 'Unknown Number'
        });
      } catch (e) {
        console.error('Failed to parse simulator user:', e);
      }
    }
  }, []);

  const handleCopy = async () => {
    if (!userInfo) return;
    
    const textToCopy = `${userInfo.name} ${userInfo.mobile}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white">
      <Alert className="rounded-none border-0 bg-orange-500 text-white">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-white flex items-center justify-between">
          <span>
            <strong>Simulating as:</strong> {userInfo ? `${userInfo.name} ${userInfo.mobile}` : 'Loading...'}
          </span>
          {userInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-white hover:bg-orange-600 h-8 px-3"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
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
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Fast-path: Accept "token-only" sessions - route immediately if token+stage are present
    const simToken = sessionStorage.getItem('simulator_auth_token');
    const simStage = sessionStorage.getItem('simulator_stage');
    
    if (simToken && simStage) {
      // Route immediately even if simulator_user isn't fully enriched yet
      const to = simStage === 'fresh_signup' || simStage === 'basic_profile'
        ? '/simulator/register'
        : '/simulator/dashboard';
      navigate(to, { replace: true });
      return () => { mounted = false; };
    }

    const timeout = setTimeout(() => {
      if (mounted) setStatus('timeout');
    }, 7000);

    const checkSession = async () => {
      for (let i = 0; i < 20; i++) {
        if (!mounted) break;

        // Check for token+stage first (token-only sessions)
        const token = sessionStorage.getItem('simulator_auth_token');
        const stage = sessionStorage.getItem('simulator_stage');
        if (token && stage) {
          const to = stage === 'fresh_signup' || stage === 'basic_profile'
            ? '/simulator/register'
            : '/simulator/dashboard';
          navigate(to, { replace: true });
          return;
        }

        // Fallback: check Supabase auth session (not typically used in simulator)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/simulator/dashboard', { replace: true });
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    };

    checkSession();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [navigate]);

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
