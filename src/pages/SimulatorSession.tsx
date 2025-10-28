import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { simulatorClient as supabase } from '@/integrations/supabase/simulatorClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

// Helper to poll for session readiness
const waitForSession = async (maxTries = 15, delayMs = 200): Promise<boolean> => {
  for (let i = 0; i < maxTries; i++) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('SimulatorSession - Session confirmed after', i + 1, 'attempts');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
};

export default function SimulatorSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const authenticateSimulator = async () => {
      try {
        const customToken = searchParams.get('custom_token');
        const stage = searchParams.get('stage');

        console.info('[SimulatorSession] 🚀 Received params:', {
          hasCustomToken: !!customToken,
          stage
        });

        if (!customToken || !stage) {
          throw new Error('Missing authentication parameters');
        }

        console.info('[SimulatorSession] 📝 Decoding JWT...');

        // Decode JWT to get user info
        const payload = JSON.parse(atob(customToken.split('.')[1]));

        // Verify token is not expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          throw new Error('Session token has expired');
        }

        // FAST PATH: Store minimal session IMMEDIATELY and navigate
        console.info('[SimulatorSession] ⚡ FAST PATH: Clearing stale auth...');
        const authKeys = [
          'simulator_auth_token',
          'simulator_user',
          'looplly_auth_token',
          'looplly_user',
          'mockUser',
          'admin_auth_token',
          'admin_user',
          'simulator' // Clear Supabase session storage key
        ];
        
        authKeys.forEach(key => {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        });

        // Store auth token and stage immediately
        sessionStorage.setItem('simulator_auth_token', customToken);
        sessionStorage.setItem('simulator_stage', stage);

        // Store minimal user snapshot from JWT
        const minimalSnapshot = {
          user_id: payload.sub,
          first_name: payload.first_name || '',
          last_name: payload.last_name || '',
          mobile: payload.mobile || '',
          country_code: payload.country_code || '+1',
          is_test_account: true,
          profile_complete: false
        };
        sessionStorage.setItem('simulator_user', JSON.stringify(minimalSnapshot));
        
        console.info('[SimulatorSession] ✅ JWT stored (fast path)', {
          user_id: minimalSnapshot.user_id,
          stage
        });

        // Navigate IMMEDIATELY (don't wait for backend)
        const showUI = searchParams.get('show_ui');
        const targetRoute = showUI === 'registration_form' || stage === 'fresh_signup'
          ? '/simulator/register'
          : '/simulator/dashboard';
        
        console.info('[SimulatorSession] 🎯 Navigating to:', targetRoute);
        navigate(targetRoute, { replace: true });

        // BACKGROUND ENRICHMENT: Fetch full profile after navigation
        console.info('[SimulatorSession] 🔄 Background enrichment: start');
        const { data: snapshot, error: fnError } = await supabase.functions.invoke('simulator-get-profile', {
          body: { custom_token: customToken }
        });

        if (fnError) {
          console.warn('[SimulatorSession] ⚠️ Background enrichment: failed', fnError);
          // Keep minimal snapshot, already navigated
          return;
        }

        if (snapshot?.is_test_account) {
          sessionStorage.setItem('simulator_user', JSON.stringify(snapshot));
          console.info('[SimulatorSession] ✅ Background enrichment: success', {
            user_id: snapshot.user_id,
            profile_complete: snapshot.profile_complete
          });
        }

      } catch (error: any) {
        console.error('[SimulatorSession] ❌ Error:', error);
        // Fallback: if edge function call fails (CORS, preview, etc.),
        // create a minimal snapshot from the JWT so the simulator can proceed
        try {
          const customToken = searchParams.get('custom_token');
          const stage = searchParams.get('stage');
          if (customToken && stage) {
            const payload = JSON.parse(atob(customToken.split('.')[1] || ''));
            const snapshot = {
              user_id: payload.sub,
              first_name: payload.first_name || '',
              last_name: payload.last_name || '',
              mobile: payload.mobile || '',
              country_code: payload.country_code || '+1',
              is_test_account: true,
              profile_complete: false
            };

            // Store fallback snapshot and auth
            sessionStorage.setItem('simulator_user', JSON.stringify(snapshot));
            sessionStorage.setItem('simulator_auth_token', customToken);
            sessionStorage.setItem('simulator_stage', stage);

            console.warn('[SimulatorSession] ⚠️ Using JWT fallback snapshot. Edge function failed.');

            // Route based on show_ui flag or stage
            const showUI = searchParams.get('show_ui');
            if (showUI === 'registration_form' || stage === 'fresh_signup') {
              navigate('/simulator/register', { replace: true });
            } else {
              navigate('/simulator/dashboard', { replace: true });
            }
            return;
          }
        } catch (fallbackErr) {
          console.error('[SimulatorSession] Fallback failed:', fallbackErr);
        }

        setError(error.message || 'Failed to initialize simulator session');
        setIsAuthenticating(false);
      }
    };

    authenticateSimulator();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Simulator Error:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Initializing Simulator</h2>
          <p className="text-sm text-muted-foreground">
            Setting up test user session...
          </p>
        </div>
      </div>
    </div>
  );
}
