import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { countries } from '@/data/countries';
import { getCountryByDialCode, getDefaultCountry, formatCountryDisplay, formatCountryOption } from '@/utils/countries';
import { useFormValidation } from '@/hooks/useFormValidation';
import { validateRegistration, RegistrationData } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { deleteConflictingUser } from '@/utils/deleteConflictingUser';
import { Eye, EyeOff, ArrowLeft, AlertCircle, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { analytics } from '@/utils/analytics';
import { validateAndNormalizeMobile } from '@/utils/mobileValidation';
import { validateAndNormalizeEmail } from '@/utils/emailValidation';
import { getMobileFormatInfo } from '@/utils/mobileFormatExamples';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';

interface RegisterProps {
  onBack: () => void;
  onSuccess: () => void;
  onOTPRequired: () => void;
}

export default function Register({ onBack, onSuccess, onOTPRequired }: RegisterProps) {
  const defaultCountry = getDefaultCountry();
  
  // Detect simulator mode to disable browser autofill
  const isSimulatorMode = window.location.pathname.includes('/simulator');
  
  const {
    formData,
    errors,
    updateField,
    validate,
    reset
  } = useFormValidation<RegistrationData>({
    initialData: {
      countryCode: defaultCountry.dialCode,
      mobile: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gpsEnabled: false,
      firstName: '',
      lastName: '',
      acceptTerms: false
    },
    validateFn: validateRegistration
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileValidation, setMobileValidation] = useState<{
    isValid: boolean;
    preview?: string;
    normalized?: string;
    error?: string;
  }>({ isValid: false });
  const { register, login, authState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Password match validation
  const passwordsMatch = formData.password && formData.confirmPassword && 
                         formData.password === formData.confirmPassword;
  const showPasswordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  // Stable token to prevent input 'name' changing every render in simulator
  const antiFillToken = useMemo(() => `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, []);

  // Guard to ensure simulator fresh_signup init runs once per session
  const freshSignupHandledRef = useRef(false);


  // Pre-populate existing profile data for simulator (Stage 2: OTP Verified)
  // For fresh_signup, pre-fill ONLY mobile/name from snapshot (not from DB)
  useEffect(() => {
    const simulatorStage = sessionStorage.getItem('simulator_stage');
    const isFreshSignup = isSimulatorMode && simulatorStage === 'fresh_signup';
    
    if (isFreshSignup) {
      if (!freshSignupHandledRef.current) {
        console.log('[Register] Simulator fresh_signup - mobile prefill disabled');
        
        const snapshotData = sessionStorage.getItem('simulator_user');
        if (snapshotData) {
          try {
            const snapshot = JSON.parse(snapshotData);
            
            // Pre-fill names for consistent test user data
            if (snapshot.first_name) updateField('firstName', snapshot.first_name);
            if (snapshot.last_name) updateField('lastName', snapshot.last_name);
            
            // Reset mobile validation to ensure no preview/error shows
            setMobileValidation({ isValid: false });

            // Mark handled to avoid repeated resets on re-renders
            freshSignupHandledRef.current = true;
          } catch (error) {
            console.error('[Register] Failed to parse simulator snapshot:', error);
          }
        } else {
          // Even without snapshot, ensure we only handle once
          freshSignupHandledRef.current = true;
        }
      }
      
      return; // Don't load from DB for fresh_signup
    }
    
    const loadExistingProfile = async () => {
      if (!authState.user?.id) return;
      
      console.log('[Register] Loading profile for user:', authState.user.id);
      
      const supabase = getSupabaseClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('mobile, country_code, first_name, last_name, date_of_birth, gps_enabled')
        .eq('user_id', authState.user.id)
        .single();
      
      console.log('[Register] Profile data fetched:', {
        user_id: authState.user.id,
        name: profile ? `${profile.first_name} ${profile.last_name}` : 'N/A',
        mobile: profile?.mobile,
        country_code: profile?.country_code
      });
      
      if (profile) {
        // Pre-populate mobile number only when NOT in simulator mode
        if (!isSimulatorMode && profile.mobile && profile.country_code) {
          const mobileWithoutCode = profile.mobile.replace(profile.country_code, '');
          updateField('mobile', mobileWithoutCode);
          updateField('countryCode', profile.country_code);
          
          console.log('[Register] Pre-filling mobile:', {
            full_mobile: profile.mobile,
            country_code: profile.country_code,
            mobile_input: mobileWithoutCode
          });
          
          // Trigger validation preview
          const result = validateAndNormalizeMobile(mobileWithoutCode, profile.country_code);
          setMobileValidation({
            isValid: result.isValid,
            preview: result.nationalFormat,
            normalized: result.normalizedNumber,
            error: result.error
          });
        }
        
        // Pre-populate names
        if (profile.first_name) updateField('firstName', profile.first_name);
        if (profile.last_name) updateField('lastName', profile.last_name);
        
        // Pre-populate DOB and GPS
        if (profile.date_of_birth) updateField('dateOfBirth', profile.date_of_birth);
        if (profile.gps_enabled !== null) updateField('gpsEnabled', profile.gps_enabled);
      }
    };
    
    loadExistingProfile();
  }, [authState.user?.id, isSimulatorMode]);

  const handleMobileChange = (value: string) => {
    updateField('mobile', value);
    
    // Real-time validation on every keystroke
    if (value.length >= 1) {
      const result = validateAndNormalizeMobile(value, formData.countryCode);
      setMobileValidation({
        isValid: result.isValid,
        preview: result.nationalFormat,
        normalized: result.normalizedNumber,
        error: result.error
      });
    } else {
      // Reset when empty
      setMobileValidation({ isValid: false, error: undefined, normalized: undefined });
    }
  };

  const handleCountryChange = (value: string) => {
    updateField('countryCode', value);
    // Re-validate mobile number with new country code immediately
    if (formData.mobile && formData.mobile.length >= 1) {
      const result = validateAndNormalizeMobile(formData.mobile, value);
      setMobileValidation({
        isValid: result.isValid,
        preview: result.nationalFormat,
        normalized: result.normalizedNumber,
        error: result.error
      });
    } else {
      // Reset when empty
      setMobileValidation({ isValid: false, error: undefined, normalized: undefined });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validate();
    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    // Block test account mobile numbers (test accounts use specific pattern)
    const normalizedMobile = `${formData.countryCode}${formData.mobile.replace(/^0+/, '')}`;
    if (normalizedMobile.includes('555000') || formData.mobile.includes('test-user')) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Test account mobile numbers are reserved for the Journey Simulator.',
        variant: 'destructive'
      });
      return;
    }

    // Track signup start
    analytics.trackSignupStart('email');

    setIsSubmitting(true);
    
    try {
      const success = await register({
        ...formData,
        dateOfBirth: formData.dateOfBirth,
        gpsEnabled: formData.gpsEnabled
      });
      if (success) {
        // Track successful signup
        analytics.trackSignup('email', true);
        
        toast({
          title: "Account created successfully!",
          description: "Let's set up your profile.",
        });
        
        // Auto-login the user with their credentials
        const normalizedMobile = `${formData.countryCode}${formData.mobile.replace(/^0+/, '')}`;
        const loginSuccess = await login(normalizedMobile, formData.password);
        
      if (loginSuccess) {
        console.log('Registration + Login successful, showing onboarding');
        sessionStorage.setItem('show_onboarding_tour', 'true');
        
        // Detect if we're in simulator mode
        const isSimulatorMode = window.location.pathname.startsWith('/simulator');
        
        if (isSimulatorMode) {
          // Mark that we've completed registration in simulator
          sessionStorage.setItem('simulator_stage', 'registered');
          navigate('/simulator/dashboard');
        } else {
          navigate('/');
        }
      }
      } else {
        // Track signup failure
        analytics.trackSignup('email', false);
        
        toast({
          title: 'Error',
          description: 'Failed to create account. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Registration catch block error:', error);
      
      // Track signup failure
      analytics.trackSignup('email', false);
      
      if (error?.code === 'user_already_exists' || error?.message?.includes('User already registered') || error?.name === 'AuthApiError') {
        toast({
          title: 'Cleaning up conflict...',
          description: 'Removing existing account data. Please try again in a moment.',
        });
        
        // Delete the conflicting user and try again
        const deleted = await deleteConflictingUser(formData.mobile, 'be3e6aad-aa1c-4e1b-814d-0896f85f1737');
        if (deleted) {
          toast({
            title: 'Ready to register',
            description: 'Previous account data cleared. Please try creating your account again.',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Could not resolve account conflict. Please contact support.',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountry = getCountryByDialCode(formData.countryCode);

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
          <CardTitle className="text-2xl font-bold text-primary">
            Create Account
          </CardTitle>
          <p className="text-muted-foreground">Join Looplly and start earning</p>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            autoComplete={isSimulatorMode ? 'off' : 'on'}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            data-lpignore={isSimulatorMode ? 'true' : undefined}
            data-1p-ignore={isSimulatorMode ? 'true' : undefined}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName || ''}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="h-12"
                  autoComplete={isSimulatorMode ? 'off' : 'given-name'}
                  name={isSimulatorMode ? `firstName_sim_${antiFillToken}` : 'firstName'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName || ''}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="h-12"
                  autoComplete={isSimulatorMode ? 'off' : 'family-name'}
                  name={isSimulatorMode ? `lastName_sim_${antiFillToken}` : 'lastName'}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country-mobile">Mobile Number *</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.countryCode} 
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className="w-24 h-12">
                     <SelectValue>
                       {selectedCountry ? formatCountryDisplay(selectedCountry) : '🇿🇦 +27'}
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
                    placeholder={getMobileFormatInfo(formData.countryCode).example}
                    value={formData.mobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    className={cn(
                      "h-12",
                      mobileValidation.error && "border-destructive",
                      mobileValidation.isValid && "border-green-500"
                    )}
                    autoComplete={isSimulatorMode ? 'off' : 'tel'}
                    name={isSimulatorMode ? `mobile_sim_${antiFillToken}` : 'mobile'}
                    required
                  />
                  
                  {/* Real-time feedback */}
                  {formData.mobile && mobileValidation.isValid && mobileValidation.normalized && (
                    <div className="flex items-center gap-1.5 text-xs" role="status" aria-live="polite">
                      <span className="text-green-600 dark:text-green-500" aria-hidden="true">✓</span>
                      <span className="text-foreground/70">
                        Will be saved as: <code className="font-mono text-foreground/90 bg-muted/50 px-1 py-0.5 rounded">{mobileValidation.normalized}</code>
                      </span>
                    </div>
                  )}
                  
                  {formData.mobile && mobileValidation.error && (
                    <p className="text-xs text-destructive" role="alert">
                      {mobileValidation.error}
                    </p>
                  )}
                  
                  {/* Helper text */}
                  {!formData.mobile && (
                    <p className="text-xs text-muted-foreground">
                      {getMobileFormatInfo(formData.countryCode).hint}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="h-12 pr-10"
                  autoComplete={isSimulatorMode ? 'off' : 'new-password'}
                  name={isSimulatorMode ? `password_sim_${antiFillToken}` : 'password'}
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
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className={cn(
                    "h-12 pr-20",
                    passwordsMatch && "border-green-500",
                    showPasswordMismatch && "border-destructive"
                  )}
                  autoComplete={isSimulatorMode ? 'off' : 'new-password'}
                  name={isSimulatorMode ? `confirmPassword_sim_${antiFillToken}` : 'confirmPassword'}
                  required
                />
                {/* Password match indicator */}
                {passwordsMatch && (
                  <div className="absolute right-12 top-0 h-12 flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {showPasswordMismatch && (
                  <div className="absolute right-12 top-0 h-12 flex items-center">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                )}
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
              {/* Helper text */}
              {passwordsMatch && (
                <p className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                  <span>Passwords match</span>
                </p>
              )}
              {showPasswordMismatch && (
                <p className="text-xs text-destructive">
                  Passwords must match
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className="h-12"
                autoComplete={isSimulatorMode ? 'off' : 'bday'}
                name={isSimulatorMode ? `dateOfBirth_sim_${antiFillToken}` : 'dateOfBirth'}
                required
              />
              <p className="text-xs text-muted-foreground">
                You must be 18+ to join Looplly
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="gps" className="font-medium cursor-pointer">Enable GPS Location</Label>
                  <p className="text-xs text-muted-foreground">
                    Helps match you with location-based surveys for better earning opportunities
                  </p>
                </div>
              </div>
              <Switch
                id="gps"
                checked={formData.gpsEnabled || false}
                onCheckedChange={(checked) => updateField('gpsEnabled', checked)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => updateField('acceptTerms', checked as boolean)}
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the Terms of Service and Privacy Policy *
              </Label>
            </div>

            <Button 
              type="submit" 
              variant="mobile" 
              size="mobile" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}