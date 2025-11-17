import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from '@/hooks/useAuth';
import { Smartphone, Loader2, AlertCircle } from 'lucide-react';

interface MobileVerificationProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MobileVerification({ open, onClose, onSuccess }: MobileVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { authState } = useAuth();
  const supabase = getSupabaseClient();

  const sendOTP = async () => {
    setIsSending(true);
    setError('');

    try {
      const mobile = authState.user?.mobile;
      const countryCode = authState.user?.countryCode;

      console.log('[NOTIFY STUB] Sending OTP to', countryCode + mobile);
      
      // TODO Phase 2: Replace with actual Notify API call
      // POST https://notify-api.com/send-otp
      
      toast({
        title: 'OTP Sent (Dev Mode)',
        description: `Verification code sent to ${countryCode}${mobile}. Use code: 12345`,
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 5) {
      setError('Please enter a 5-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const userId = authState.user?.id;
      if (!userId) throw new Error('No user ID');

      // TODO: Create production verify-otp edge function to replace archived mock-looplly-verify-otp
      // For now, accepting code '12345' in development
      if (otp !== '12345') {
        setError('Invalid OTP code. Try 12345 (development mode)');
        return;
      }

      // Update local user state
      const loopllyUser = localStorage.getItem('looplly_user');
      if (loopllyUser) {
        const user = JSON.parse(loopllyUser);
        user.isVerified = true;
        localStorage.setItem('looplly_user', JSON.stringify(user));
      }

      toast({
        title: 'Mobile Verified!',
        description: 'You can now start earning with surveys and opportunities.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify OTP. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Verify Your Mobile
          </DialogTitle>
          <DialogDescription>
            Enter the 5-digit code sent to {authState.user?.countryCode}{authState.user?.mobile}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={5}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError('');
              }}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={verifyOTP}
              disabled={isVerifying || otp.length !== 5}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={sendOTP}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Development Mode: Use code <span className="font-mono font-bold">12345</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
