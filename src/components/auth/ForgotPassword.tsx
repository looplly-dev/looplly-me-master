import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';
import { countries } from '@/data/countries';
import { getCountryByDialCode, getDefaultCountry, formatCountryDisplay, formatCountryOption } from '@/utils/countries';
import { validateAndNormalizeMobile } from '@/utils/mobileValidation';
import { getMobileFormatInfo } from '@/utils/mobileFormatExamples';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const defaultCountry = getDefaultCountry();
  
  const [step, setStep] = useState<'mobile' | 'otp' | 'password'>('mobile');
  const [countryCode, setCountryCode] = useState(defaultCountry.dialCode);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return;

    // Validate mobile number
    const mobileValidation = validateAndNormalizeMobile(mobile, countryCode);
    if (!mobileValidation.isValid) {
      toast({
        title: 'Invalid Mobile Number',
        description: mobileValidation.error || 'Please enter a valid mobile number',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedMobile = mobileValidation.normalizedNumber!;
      
      // Send OTP to mobile
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedMobile
      });

      if (error) throw error;

      toast({
        title: 'OTP Sent',
        description: 'Verification code sent to your mobile number',
      });
      setStep('otp');
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    // Validate mobile number
    const mobileValidation = validateAndNormalizeMobile(mobile, countryCode);
    if (!mobileValidation.isValid) return;

    setIsSubmitting(true);
    try {
      const normalizedMobile = mobileValidation.normalizedNumber!;

      // Verify OTP
      const { error } = await supabase.auth.verifyOtp({
        phone: normalizedMobile,
        token: otpCode,
        type: 'sms'
      });

      if (error) throw error;

      toast({
        title: 'Verified',
        description: 'Now set your new password',
      });
      setStep('password');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: 'Invalid Code',
        description: 'Please enter the correct verification code',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.password !== passwords.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update password using current session from OTP verification
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password reset successfully! Please login.',
      });
      
      // Sign out to force re-login with new password
      await supabase.auth.signOut();
      onBack();
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-card border">
        <CardHeader className="text-center pb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Key className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {step === 'mobile' && 'Reset Password'}
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'password' && 'Set New Password'}
          </CardTitle>
          <p className="text-muted-foreground">
            {step === 'mobile' && 'Enter your mobile number to receive an OTP'}
            {step === 'otp' && 'Enter the 6-digit code sent to your mobile'}
            {step === 'password' && 'Choose a strong password for your account'}
          </p>
        </CardHeader>
        <CardContent>
          {step === 'mobile' && (
            <form onSubmit={handleMobileSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex gap-2">
                  <Select 
                    value={countryCode} 
                    onValueChange={setCountryCode}
                  >
                    <SelectTrigger className="w-24 h-12">
                      <SelectValue>
                        {formatCountryDisplay(getCountryByDialCode(countryCode) || defaultCountry)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.dialCode}>
                          <span className="flex items-center gap-2">
                            {formatCountryOption(country)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 space-y-1">
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder={getMobileFormatInfo(countryCode).example}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="h-12"
                      required
                    />
                    {!mobile && (
                      <p className="text-xs text-muted-foreground">
                        {getMobileFormatInfo(countryCode).hint}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                variant="mobile" 
                size="mobile" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Enter 6-digit code</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`reset-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="h-12 w-12 text-center text-lg font-semibold"
                    />
                  ))}
                </div>
              </div>
              <Button 
                type="submit" 
                variant="mobile" 
                size="mobile" 
                className="w-full"
                disabled={isSubmitting || otp.join('').length !== 6}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => setStep('mobile')}
              >
                Change mobile number
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={passwords.password}
                    onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                    className="h-12 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="h-12 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="mobile" 
                size="mobile" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}