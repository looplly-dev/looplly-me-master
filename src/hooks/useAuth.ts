import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { User, AuthState } from '@/types/auth';
import { registerUser, loginUser, logoutUser, resetUserPassword } from '@/utils/auth';
import { updateUserProfile, fetchUserProfile } from '@/utils/profile';
import { createDemoEarningActivities } from '@/utils/demoData';
import { rateLimiter, withRateLimit } from '@/utils/rateLimiter';
import { auditActions } from '@/utils/auditLogger';
import { isPreview } from '@/utils/runtimeEnv';

const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string, password: string, expectedUserType?: 'looplly_user' | 'looplly_team_user' | 'client_user') => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  completeProfile: (profile: any) => Promise<boolean>;
  updateCommunicationPreferences: (preferences: any) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, password: string) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Real Supabase authentication
export const useAuthLogic = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    step: 'login'
  });

  if (import.meta.env.DEV && !isPreview()) {
    console.log('useAuthLogic - Current authState:', authState);
  }

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();
    
    // Diagnostic logging (dev only, not in Preview)
    if (import.meta.env.DEV && !isPreview()) {
      const path = window.location.pathname;
      console.info('[useAuth] Active client for path:', path, 'is', 
        path.startsWith('/simulator') ? 'simulatorClient' : 'mainClient');
    }
    
    // 1. CHECK SIMULATOR JWT IN SESSION STORAGE (highest priority in simulator)
    const inSimulator = window.location.pathname.startsWith('/simulator');
    const simulatorToken = sessionStorage.getItem('simulator_auth_token');
    const simulatorUser = sessionStorage.getItem('simulator_user');

    if (inSimulator && simulatorToken && simulatorUser) {
      try {
        const payload = JSON.parse(atob(simulatorToken.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp < now) {
          console.log('Simulator JWT expired, clearing...');
          sessionStorage.removeItem('simulator_auth_token');
          sessionStorage.removeItem('simulator_user');
        } else {
          const snap = JSON.parse(simulatorUser);
          console.log('Using simulator snapshot without DB fetch');
          setAuthState({
            user: {
              id: snap.user_id || snap.id,
              mobile: snap.mobile,
              countryCode: snap.country_code || '+1',
              firstName: snap.first_name || snap.firstName || '',
              lastName: snap.last_name || snap.lastName || '',
              email: snap.email,
              isVerified: snap.is_verified ?? false,
              profileComplete: snap.profile_complete ?? false,
              profile: {
                sec: (snap.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
                gender: (snap.gender as 'male' | 'female' | 'other') || 'other',
                dateOfBirth: snap.date_of_birth ? new Date(snap.date_of_birth) : new Date('1990-01-01'),
                address: snap.address || '',
                gpsEnabled: snap.gps_enabled ?? true,
                firstName: snap.first_name || snap.firstName || '',
                lastName: snap.last_name || snap.lastName || '',
                email: snap.email || ''
              }
            },
            isAuthenticated: true,
            isLoading: false,
            step: snap.profile_complete ? 'dashboard' : 'profile-setup'
          });
          return;
        }
      } catch (error) {
        console.error('Error parsing simulator JWT/snapshot:', error);
        sessionStorage.removeItem('simulator_auth_token');
        sessionStorage.removeItem('simulator_user');
      }
    }
    
    // 2. CHECK CUSTOM LOOPLLY JWT (localStorage) - BUT NOT ON ADMIN ROUTES
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const loopllyToken = localStorage.getItem('looplly_auth_token');
    const loopllyUser = localStorage.getItem('looplly_user');

    // Skip Looplly JWT on admin routes to prevent regular user context from hijacking
    if (!isAdminRoute && loopllyToken && loopllyUser) {
      try {
        const payload = JSON.parse(atob(loopllyToken.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp < now) {
          console.log('Looplly JWT expired, clearing...');
          localStorage.removeItem('looplly_auth_token');
          localStorage.removeItem('looplly_user');
        } else {
          console.log('Found valid Looplly JWT, setting initial state...');
          const user = JSON.parse(loopllyUser);

          // Set initial state but DON'T return - we need to attach the listener
          setAuthState({
            user: {
              id: user.id,
              mobile: user.mobile,
              countryCode: user.country_code || '+1',
              firstName: user.first_name || user.firstName || '',
              lastName: user.last_name || user.lastName || '',
              email: user.email,
              isVerified: user.is_verified ?? false,
              profileComplete: user.profile_complete ?? false,
              profile: user.profile
            },
            isAuthenticated: true,
            isLoading: false,
            step: 'dashboard'
          });

          // Fetch fresh profile in background but don't block
          setTimeout(async () => {
            if (!mounted) return;
            const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
            if (profile && mounted) {
              setAuthState({
                user: {
                  id: profile.user_id,
                  mobile: profile.mobile,
                  countryCode: profile.country_code,
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  email: profile.email,
                  isVerified: profile.is_verified,
                  profileComplete: profile.profile_complete,
                  profile: profile ? {
                    sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
                    gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
                    dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
                    address: profile.address || '',
                    gpsEnabled: profile.gps_enabled || false,
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    email: profile.email || '',
                    country_code: profile.country_code,
                    country_iso: profile.country_iso
                  } : undefined
                },
                isAuthenticated: true,
                isLoading: false,
                step: 'dashboard'
              });
            }
          }, 0);
          // Continue to attach listener below - don't return!
        }
      } catch (error) {
        console.error('Error parsing Looplly JWT:', error);
        localStorage.removeItem('looplly_auth_token');
        localStorage.removeItem('looplly_user');
      }
    }
    
    // 2. SECURITY: Validate mock user has proper structure and security tokens
    // Mock users should only be used for demo purposes, never for production
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      try {
        const user = JSON.parse(mockUser);
        
        // Validate mock user structure
        if (!user.id || !user.email || user.email !== 'demo@looplly.com') {
          console.warn('Invalid mock user detected, removing');
          localStorage.removeItem('mockUser');
        } else {
          console.log('Found valid demo user in localStorage');
          if (mounted) {
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              step: 'dashboard'
            });
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing mock user from localStorage:', error);
        localStorage.removeItem('mockUser');
      }
    }
    
    // Helper function to process session with SMART TABLE DETECTION
    const processSession = async (session: Session | null, event?: string) => {
      if (!mounted) return;
      
      if (!session?.user) {
        if (mounted) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            step: 'login'
          });
        }
        return;
      }

      try {
        console.log('Fetching user data for:', session.user.id);
        const activeSupabase = getSupabaseClient();
        
        let profile = null;
        let teamProfile = null;
        let isTeamMember = false;

        // CRITICAL: Check team membership FIRST via secure RPC to avoid conflicts with stale profiles table
        const { data: isTeamMemberResult, error: teamCheckError } = await activeSupabase
          .rpc('is_team_member', { _user_id: session.user.id });
        
        if (teamCheckError) {
          console.error('[useAuth] Error checking team membership via RPC:', teamCheckError);
        }
        
        if (isTeamMemberResult) {
          // User is a team member - fetch team profile data
          const { data: teamData, error: teamError } = await activeSupabase
            .from('team_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (teamData) {
            teamProfile = teamData;
            isTeamMember = true;
            if (import.meta.env.DEV) {
              console.info('[useAuth] Team member verified via RPC:', teamProfile.email);
            }
          } else if (teamError && teamError.code !== 'PGRST116') {
            console.error('[useAuth] Error fetching team profile data:', teamError);
          }
        } else {
          // Not a team member - check profiles table for regular users
          const { data: profileData, error: profileError } = await activeSupabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profileData) {
            profile = profileData;
            console.log('[useAuth] User found in profiles table:', profile.email);
          } else if (profileError && profileError.code !== 'PGRST116') {
            console.error('[useAuth] Error fetching profile:', profileError);
          }
        }

        if (!mounted) return;

        // If user not in either table, this is a problem
        if (!profile && !teamProfile) {
          console.error('[useAuth] User not found in profiles OR team_profiles');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            step: 'login'
          });
          return;
        }

        // ==========================================
        // TEAM MEMBER FLOW (looplly_team_user)
        // ==========================================
        if (isTeamMember && teamProfile) {
          // Check must_change_password for team members
          if (teamProfile.must_change_password) {
            // Check if temp password expired
            if (teamProfile.temp_password_expires_at && 
                new Date(teamProfile.temp_password_expires_at) < new Date()) {
              console.log('[useAuth] Temporary password expired for team member');
              await logoutUser();
              if (mounted) {
                setAuthState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  step: 'login'
                });
              }
              return;
            }
            
            console.log('[useAuth] Team member must change password');
            if (mounted) {
              const teamUser: User = {
                id: session.user.id,
                mobile: '',
                countryCode: '',
                email: session.user.email || teamProfile.email || '',
                firstName: teamProfile.first_name || '',
                lastName: teamProfile.last_name || '',
                isVerified: true,
                profileComplete: true,
                mustChangePassword: true
              };
              
              setAuthState({
                user: teamUser,
                isAuthenticated: true,
                isLoading: false,
                step: 'login'
              });
            }
            return;
          }
          
          // Normal team member - direct to dashboard
          console.log('[useAuth] Team member authenticated');
          if (mounted) {
            const teamUser: User = {
              id: session.user.id,
              mobile: '',
              countryCode: '',
              email: session.user.email || teamProfile.email || '',
              firstName: teamProfile.first_name || '',
              lastName: teamProfile.last_name || '',
              isVerified: true,
              profileComplete: true,
              mustChangePassword: false
            };
            
            setAuthState({
              user: teamUser,
              isAuthenticated: true,
              isLoading: false,
              step: 'dashboard'
            });
            
            // Audit log for team member login
            if (event === 'SIGNED_IN') {
              setTimeout(() => {
                auditActions.login(session.user.id, { 
                  method: 'email_password',
                  user_type: 'looplly_team_user',
                  email: teamProfile.email
                }).catch(console.error);
              }, 0);
            }
          }
          return; // Exit early for team members
        }

        // ==========================================
        // REGULAR USER FLOW (looplly_user)
        // ==========================================
        if (profile) {
          // TEST ACCOUNT CHECK: Only allow in simulator context
          if (profile.is_test_account && !window.location.pathname.startsWith('/simulator')) {
            console.warn('[useAuth] Test account attempted access outside simulator:', profile.email);
            await logoutUser();
            if (mounted) {
              setAuthState({ user: null, isAuthenticated: false, isLoading: false, step: 'login' });
            }
            return;
          }
          
          const user: User = {
            id: session.user.id,
            mobile: profile?.mobile || session.user.phone || '',
            countryCode: profile?.country_code || '+1',
            email: session.user.email || undefined,
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            isVerified: session.user.email_confirmed_at !== null,
            profileComplete: profile?.profile_complete || false,
            profile: {
              sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
              gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
              dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
              address: profile.address || '',
              gpsEnabled: profile.gps_enabled || false,
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || session.user.email || '',
              country_code: profile.country_code,
              country_iso: profile.country_iso
            }
          };

          console.log('[useAuth] Regular user authenticated');
          if (mounted) {
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              step: !profile?.profile_complete ? 'profile-setup' : 'dashboard'
            });
            
            // Audit log for regular user login
            if (event === 'SIGNED_IN') {
              setTimeout(() => {
                auditActions.login(session.user.id, { 
                  method: 'email_password',
                  profile_complete: profile?.profile_complete || false,
                  user_type: 'looplly_user',
                  is_test_account: profile?.is_test_account || false
                }).catch(console.error);
              }, 0);
            }
          }
        }
      } catch (error) {
        console.error('Error processing auth state:', error);
        if (!mounted) return;
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          step: 'login'
        });
      } finally {
        // Always set loading to false
        if (mounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (!mounted) return;
        
        // Use setTimeout to avoid blocking the auth state change
        setTimeout(() => processSession(session, event), 0);
      }
    );

    // FAST-PATH: Immediately check for existing session (don't wait for auth state change event)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Fast-path session check:', session?.user?.id || 'no session');
      if (mounted && session) {
        processSession(session).catch(error => {
          console.error('[useAuth] Fast-path error:', error);
          if (mounted) {
            setAuthState({ user: null, isAuthenticated: false, isLoading: false, step: 'login' });
          }
        });
      } else if (mounted && !session) {
        // No session found, immediately set unauthenticated
        setAuthState({ user: null, isAuthenticated: false, isLoading: false, step: 'login' });
      }
    }).catch(error => {
      console.error('[useAuth] Fast-path session check error:', error);
      if (mounted) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false, step: 'login' });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const register = withRateLimit('registration', async (data: any): Promise<boolean> => {
    console.log('Registering user with data:', data);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await registerUser({
        mobile: data.mobile,
        countryCode: data.countryCode,
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });

      if (result.success) {
        // Stop loading and move to OTP step (no session yet after sign-up)
        setAuthState(prev => ({ ...prev, isLoading: false, step: 'otp-verification' }));
        return true;
      } else {
        console.error('Registration failed:', result.error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  });

  const login = withRateLimit('login', async (email: string, password: string, expectedUserType?: 'looplly_user' | 'looplly_team_user' | 'client_user'): Promise<boolean> => {
    console.log('Logging in user with email:', email, 'expected type:', expectedUserType);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
    const supabase = getSupabaseClient();
      
      // Check for demo/mock login
      if (email === 'demo@looplly.com' && password === 'demo123') {
        console.log('Using mock login for demo user');
        
        // Create mock user directly
        const mockUser: User = {
          id: '12345678-1234-1234-1234-123456789012',
          mobile: '+1234567890',
          countryCode: '+1',
          email: 'demo@looplly.com',
          firstName: 'Demo',
          lastName: 'User',
          isVerified: true,
          profileComplete: true,
          profile: {
            sec: 'B' as const,
            gender: 'other' as const,
            dateOfBirth: new Date('1990-01-01'),
            address: '123 Demo Street, Demo City',
            gpsEnabled: true,
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@looplly.com'
          }
        };

        // Store mock user in localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));

        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          step: 'dashboard'
        });
        
        return true;
      }
      
      // Determine if this is mobile login (Looplly custom auth)
      const isMobileLogin = email.startsWith('+');
      
      // For Looplly mobile users, use custom auth
      if (isMobileLogin) {
        const result = await loginUser({ email, password });
        
        if (result.success) {
          // Custom JWT is now stored in localStorage
          // Use the user data returned from login (already includes profile data)
          const loopllyUser = localStorage.getItem('looplly_user');
          if (loopllyUser) {
            const user = JSON.parse(loopllyUser);
            
            console.log('[useAuth] Setting auth state from login response:', user);
            
            // Set auth state directly from login response
            setAuthState({
              user: {
                id: user.id,
                mobile: user.mobile || email,
                countryCode: user.countryCode || user.country_code || '+27',
                firstName: user.firstName || user.first_name || '',
                lastName: user.lastName || user.last_name || '',
                email: user.email || '',
                isVerified: user.isVerified ?? user.is_verified ?? false,
                profileComplete: user.profileComplete ?? user.profile_complete ?? false,
                profile: {
                  sec: 'B' as const,
                  gender: 'other' as const,
                  dateOfBirth: new Date('1990-01-01'),
                  address: '',
                  gpsEnabled: false,
                  firstName: user.firstName || user.first_name || '',
                  lastName: user.lastName || user.last_name || '',
                  email: user.email || '',
                  country_code: user.countryCode || user.country_code,
                  country_iso: user.country_iso
                }
              },
              isAuthenticated: true,
              isLoading: false,
              step: 'dashboard'
            });
            
            // Fetch fresh profile in background (non-blocking)
            setTimeout(async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', user.id)
                  .maybeSingle();
                
                if (profile) {
                  console.log('[useAuth] Background profile refresh successful');
                  setAuthState({
                    user: {
                      id: profile.user_id,
                      mobile: profile.mobile,
                      countryCode: profile.country_code,
                      firstName: profile.first_name,
                      lastName: profile.last_name,
                      email: profile.email,
                      isVerified: profile.is_verified,
                      profileComplete: profile.profile_complete,
                      profile: {
                        sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
                        gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
                        dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
                        address: profile.address || '',
                        gpsEnabled: profile.gps_enabled || false,
                        firstName: profile.first_name || '',
                        lastName: profile.last_name || '',
                        email: profile.email || '',
                        country_code: profile.country_code,
                        country_iso: profile.country_iso
                      }
                    },
                    isAuthenticated: true,
                    isLoading: false,
                    step: 'dashboard'
                  });
                }
              } catch (error) {
                console.warn('[useAuth] Background profile refresh failed:', error);
                // Non-critical, continue with login response data
              }
            }, 100);
            
            return true;
          }
          
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return false;
        } else {
          console.error('Mobile login failed:', result.error);
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return false;
        }
      }
      
      // For admin/team users with EMAIL, use Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('[useAuth] Supabase auth error:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (!data.user) {
        console.error('[useAuth] No user returned from Supabase');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Validate user type if specified
      if (expectedUserType) {
        if (expectedUserType === 'looplly_team_user') {
          // Use secure RPC to check team membership (bypasses RLS)
          const { data: isTeamMemberResult, error: teamCheckError } = await supabase
            .rpc('is_team_member', { _user_id: data.user.id });

          if (teamCheckError) {
            console.error('[useAuth] Error checking team membership via RPC:', teamCheckError);
            await supabase.auth.signOut();
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw new Error('Unable to verify team membership. Please try again.');
          }

          if (!isTeamMemberResult) {
            if (import.meta.env.DEV) {
              console.info('[useAuth] Team membership check failed via RPC');
            }
            await supabase.auth.signOut();
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw new Error('Access denied. This portal is for team members only. Please use the main site to log in.');
          }
          
          if (import.meta.env.DEV) {
            console.info('[useAuth] Team membership verified via RPC');
          }
        } else if (expectedUserType === 'looplly_user') {
          // Check profiles table for regular users
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!profile) {
            console.error('[useAuth] Regular user not found in profiles');
            await supabase.auth.signOut();
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw new Error('Please use the admin portal at /admin/login to access your team account.');
          }
        }
      }

      // Fast-path: set auth state immediately so UI doesn't spin
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        
        if (session?.user) {
          // CRITICAL: Check team membership FIRST to avoid conflicts with stale profiles
          let profile = null;
          let teamProfile = null;
          let isTeamMember = false;
          
          // Check team membership via secure RPC FIRST
          const { data: isTeamMemberResult } = await supabase
            .rpc('is_team_member', { _user_id: session.user.id });
          
          if (isTeamMemberResult) {
            // User is a team member - fetch team profile data
            const { data: teamData } = await supabase
              .from('team_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (teamData) {
              teamProfile = teamData;
              isTeamMember = true;
              if (import.meta.env.DEV) {
                console.info('[useAuth] Fast-path: Team member verified via RPC');
              }
            }
          } else {
            // Not a team member - check profiles for regular users
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (profileData) {
              profile = profileData;
            }
          }
          
          // Build user object based on type
          const fastUser: User = isTeamMember
            ? {
                id: session.user.id,
                mobile: '',
                countryCode: '',
                email: session.user.email || teamProfile?.email || '',
                firstName: teamProfile?.first_name || '',
                lastName: teamProfile?.last_name || '',
                isVerified: true,
                profileComplete: true,
                mustChangePassword: teamProfile?.must_change_password || false
              }
            : {
                id: session.user.id,
                mobile: profile?.mobile || session.user.phone || '',
                countryCode: profile?.country_code || '+1',
                email: session.user.email || profile?.email || undefined,
                firstName: profile?.first_name || '',
                lastName: profile?.last_name || '',
                isVerified: session.user.email_confirmed_at !== null,
                profileComplete: profile?.profile_complete || false,
                mustChangePassword: profile?.must_change_password || false,
                profile: profile
                  ? {
                      sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
                      gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
                      dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
                      address: profile.address || '',
                      gpsEnabled: profile.gps_enabled || false,
                      firstName: profile.first_name || '',
                      lastName: profile.last_name || '',
                      email: profile.email || session.user.email || '',
                      country_code: profile.country_code,
                      country_iso: profile.country_iso
                    }
                  : undefined
              };
          
          // Determine step
          const fastStep = isTeamMember 
            ? 'dashboard' 
            : (profile?.profile_complete ? 'dashboard' : 'profile-setup');
          
          setAuthState({
            user: fastUser,
            isAuthenticated: true,
            isLoading: false,
            step: fastStep
          });
          
          console.info('[useAuth] Fast-path set:', isTeamMember ? 'team member' : 'regular user');
        } else {
          setAuthState(prev => ({ ...prev, isAuthenticated: true, isLoading: false }));
        }
      } catch (e) {
        console.warn('[useAuth] Fast-path failed, listener will handle:', e);
        setAuthState(prev => ({ ...prev, isAuthenticated: true, isLoading: false }));
      }

      // Auth state will also be updated by onAuthStateChange listener
      console.log('[useAuth] Supabase login successful, auth listener will handle state');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error; // Re-throw to let caller handle the specific error message
    }
  });

  const verifyOTP = async (code: string): Promise<boolean> => {
    console.log('Verifying OTP:', code);
    const supabase = getSupabaseClient();
    // Demo OTP: accept exactly "12345"
    if (code === '12345') {
      // Update profiles.is_verified = true
      if (authState.user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('user_id', authState.user.id);
        
        if (updateError) {
          console.error('Failed to update verification status:', updateError);
          return false;
        }
        
        // Refresh user state
        await refreshUserProfile();
      }
      
      return true;
    }
    return false;
  };
  
  const refreshUserProfile = async () => {
    if (!authState.user?.id) return;
    const supabase = getSupabaseClient();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authState.user.id)
      .single();
    
    if (profile) {
      // Update authState with ALL fresh fields (including is_verified, profile_complete, etc.)
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          isVerified: profile.is_verified,
          profileComplete: profile.profile_complete,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          mobile: profile.mobile,
          countryCode: profile.country_code,
          email: profile.email,
          profile: {
            sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
            gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
            dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
            address: profile.address || '',
            gpsEnabled: profile.gps_enabled || false,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            country_code: profile.country_code,
            country_iso: profile.country_iso,
            user_type: profile.user_type,
            company_name: profile.company_name,
            company_role: profile.company_role,
            must_change_password: profile.must_change_password,
            is_verified: profile.is_verified
          }
        } : null
      }));

      // Update localStorage to keep it in sync
      localStorage.setItem('looplly_user', JSON.stringify({
        id: profile.user_id,
        mobile: profile.mobile,
        country_code: profile.country_code,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        is_verified: profile.is_verified,
        profile_complete: profile.profile_complete,
        profile: {
          sec: profile.sec,
          gender: profile.gender,
          date_of_birth: profile.date_of_birth,
          address: profile.address,
          gps_enabled: profile.gps_enabled,
          country_code: profile.country_code,
          country_iso: profile.country_iso,
          user_type: profile.user_type,
          company_name: profile.company_name,
          company_role: profile.company_role,
          must_change_password: profile.must_change_password,
          is_verified: profile.is_verified
        }
      }));
      
      console.log('[refreshUserProfile] Profile refreshed, is_verified:', profile.is_verified);
    }
  };

  const completeProfile = async (profileData: any): Promise<boolean> => {
    console.log('Completing profile:', profileData);
    const supabase = getSupabaseClient();
    
    if (!authState.user?.id) {
      return false;
    }

    try {
      const success = await updateUserProfile(authState.user.id, profileData);
      
      if (success) {
        // Fetch the updated profile to get the complete data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authState.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching updated profile:', profileError);
        }

        // Update the auth state with profile complete flag
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            profileComplete: true,
            profile: profile ? {
              sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
              gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
              dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
              address: profile.address || '',
              gpsEnabled: profile.gps_enabled || false,
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || ''
            } : prev.user.profile
          } : null,
          step: 'dashboard'
        }));

        // Audit log profile completion
        auditActions.dataModify(authState.user.id, 'complete', 'profile', authState.user.id, { 
          profile_completed: true
        }).catch(console.error);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile completion error:', error);
      return false;
    }
  };

  const updateCommunicationPreferences = async (preferences: any): Promise<boolean> => {
    console.log('Updating communication preferences:', preferences);
    const supabase = getSupabaseClient();
    
    if (!authState.user?.id) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('communication_preferences')
        .upsert({
          user_id: authState.user.id,
          ...preferences
        });

      if (error) {
        console.error('Error updating communication preferences:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Communication preferences update error:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    
    // Clear all localStorage auth-related data
    localStorage.removeItem('mockUser');
    localStorage.removeItem('onboarding_completed');
    
    await logoutUser();
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    console.log('Initiating password reset for email:', email);
    
    try {
      const result = await resetUserPassword(email);
      return result.success;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, otp: string, password: string): Promise<boolean> => {
    console.log('Resetting password for email:', email);
    // In a real implementation, this would verify OTP and reset password
    // For now, we'll simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  return {
    authState,
    login,
    verifyOTP,
    register,
    completeProfile,
    updateCommunicationPreferences,
    logout,
    forgotPassword,
    resetPassword,
    refreshUserProfile
  };
};

export { AuthContext };
