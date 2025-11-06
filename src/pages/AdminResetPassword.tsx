import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Shield, Loader2 } from 'lucide-react';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least 1 number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character');

export default function AdminResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for recovery session on mount
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Recovery session check:', { 
          hasSession: !!session,
          userId: session?.user?.id
        });

        if (!session) {
          toast({
            title: 'Invalid Reset Link',
            description: 'Please use the password reset link from your email.',
            variant: 'destructive'
          });
          navigate('/admin/login');
          return;
        }

        setIsRecoveryReady(true);
      } catch (error) {
        console.error('Session check error:', error);
        toast({
          title: 'Session Error',
          description: 'Unable to verify reset session. Please try again.',
          variant: 'destructive'
        });
        navigate('/admin/login');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, [navigate, toast]);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: '1 number', met: /[0-9]/.test(newPassword) },
    { label: '1 special character', met: /[^A-Za-z0-9]/.test(newPassword) }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRecoveryReady) {
      toast({
        title: 'Session Not Ready',
        description: 'Please wait for the session to be verified.',
        variant: 'destructive'
      });
      return;
    }

    // Validate password
    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      toast({
        title: 'Password Requirements Not Met',
        description: validation.error.issues[0].message,
        variant: 'destructive'
      });
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are identical',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      
      // Get current user from active session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No active session found');
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passwordError) throw passwordError;

      // Update profile flags (team member profiles might be in team_profiles or profiles)
      const { error: profileError } = await supabase
        .from('team_profiles')
        .update({
          must_change_password: false,
          temp_password_expires_at: null
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw - password was changed successfully
      }

      // Log audit event
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'team_member_password_changed',
          resource_type: 'user',
          resource_id: user.id,
          metadata: {
            reset_at: new Date().toISOString(),
            first_login: true
          }
        });

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed. Please log in with your new password.'
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate('/admin/login');

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Failed to update password',
        description: error.message || 'An error occurred while updating your password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying reset session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Set Your Admin Password
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Welcome to the team! Please create a secure password to continue.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            {/* Password Requirements */}
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isSubmitting || !isRecoveryReady}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Set New Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
