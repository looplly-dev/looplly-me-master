import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Check } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { getCurrentUserId, getCurrentUserMobile } from '@/utils/authHelper';

export default function VerifyMobile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [mobile, setMobile] = useState('+27 XX XXX XXXX');

  const DEMO_CODE = '12345';

  // Fetch mobile number from profile
  useEffect(() => {
    const fetchMobile = async () => {
      const mobile = await getCurrentUserMobile();
      if (mobile) {
        setMobile(mobile);
      }
    };
    fetchMobile();
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 5) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 5-digit verification code',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Demo: Accept 12345 as valid code
      if (otp === DEMO_CODE) {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('Not authenticated');

        // Mark as verified
        const { error } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('user_id', userId);

        if (error) throw error;

        toast({
          title: '✅ Mobile Verified!',
          description: 'You\'re all set! Start earning now.',
        });

        // Navigate back to dashboard
        navigate('/');
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The code you entered is incorrect. Try again or request a new code.',
          variant: 'destructive'
        });
        setOtp('');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;

    setCanResend(false);
    toast({
      title: 'Code Sent',
      description: 'A new verification code has been sent to your mobile.',
    });

    // Re-enable after 30 seconds
    setTimeout(() => setCanResend(true), 30000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* Shield Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full border-4 border-primary/30">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Verify Your Mobile</h1>
            <p className="text-muted-foreground">
              We've sent a 5-digit code to
            </p>
            <p className="text-lg font-semibold">{mobile}</p>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <InputOTP
              maxLength={5}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
            >
              <InputOTPGroup className="gap-2 justify-center">
                <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>

            {/* Demo Helper */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                💡 <span className="font-medium">Demo Mode:</span> Use code <span className="font-mono font-bold">{DEMO_CODE}</span>
              </p>
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 5 || isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              'Verifying...'
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Verify Mobile
              </>
            )}
          </Button>

          {/* Resend Link */}
          <div className="pt-2">
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`text-sm font-medium ${
                canResend
                  ? 'text-primary hover:underline'
                  : 'text-muted-foreground cursor-not-allowed'
              }`}
            >
              {canResend ? 'Resend Code' : 'Code sent (wait 30s)'}
            </button>
          </div>

          {/* Skip for now (optional) */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              I'll do this later
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
