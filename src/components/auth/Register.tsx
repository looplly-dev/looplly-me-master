import { useState, useEffect } from 'react';
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
import { Eye, EyeOff, ArrowLeft, AlertCircle, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { analytics } from '@/utils/analytics';
import { validateAndNormalizeMobile } from '@/utils/mobileValidation';
import { validateAndNormalizeEmail } from '@/utils/emailValidation';
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
  
  const {
    formData,
    errors,
    updateField,
    validate
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
    error?: string;
  }>({ isValid: false });
  const { register, authState } = useAuth();
  const { toast } = useToast();

  // Pre-populate existing profile data for simulator (Stage 2: OTP Verified)
  useEffect(() => {
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
        // Pre-populate mobile number (strip dial code for input field)
        if (profile.mobile && profile.country_code) {
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
  }, [authState.user?.id]);

  const handleMobileChange = (value: string) => {
    updateField('mobile', value);
    
    // Real-time validation
    if (value.length >= 3) {
      const result = validateAndNormalizeMobile(value, formData.countryCode);
      setMobileValidation({
        isValid: result.isValid,
        preview: result.nationalFormat,
        error: result.error
      });
    } else {
      setMobileValidation({ isValid: false });
    }
  };

  const handleCountryChange = (value: string) => {
    updateField('countryCode', value);
    // Re-validate mobile number with new country code
    if (formData.mobile && formData.mobile.length >= 3) {
      const result = validateAndNormalizeMobile(formData.mobile, value);
      setMobileValidation({
        isValid: result.isValid,
        preview: result.nationalFormat,
        error: result.error
      });
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
          title: 'Account Created!',
          description: 'Please verify your account with the OTP sent to your mobile.',
        });
        onOTPRequired();
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="823093959 or 0823093959"
                    value={formData.mobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    className={cn(
                      "h-12",
                      mobileValidation.error && "border-destructive",
                      mobileValidation.isValid && "border-green-500"
                    )}
                    required
                  />
                  
                  {/* Real-time feedback */}
                  {formData.mobile && mobileValidation.preview && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-green-600">✓</span>
                      <span className="text-muted-foreground">
                        Will be saved as: {mobileValidation.preview}
                      </span>
                    </div>
                  )}
                  
                  {mobileValidation.error && (
                    <p className="text-xs text-destructive">
                      {mobileValidation.error}
                    </p>
                  )}
                  
                  {/* Helper text */}
                  {!formData.mobile && (
                    <p className="text-xs text-muted-foreground">
                      Enter without country code (leading 0 is okay)
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

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className="h-12"
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