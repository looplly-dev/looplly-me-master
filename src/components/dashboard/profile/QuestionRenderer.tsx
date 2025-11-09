import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AddressFieldsInput } from '@/components/ui/address-fields-input';
import type { AddressComponents } from '@/services/googlePlacesService';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon, AlertCircle, Lock, Clock, Check, X } from 'lucide-react';
import type { ProfileQuestion } from '@/hooks/useProfileQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { validateAndNormalizeMobile } from '@/utils/mobileValidation';
import { getMobileFormatInfo } from '@/utils/mobileFormatExamples';
import { getAllCountries, formatCountryDisplay, getCountryNameFromDialCode } from '@/utils/countries';

interface QuestionRendererProps {
  question: ProfileQuestion;
  onAnswerChange: (questionId: string, value: any) => void;
  onAddressChange?: (address: AddressComponents) => void;
  disabled?: boolean;
}

export function QuestionRenderer({ question, onAnswerChange, onAddressChange, disabled }: QuestionRendererProps) {
  const [value, setValue] = useState<any>(
    question.user_answer?.answer_json || question.user_answer?.answer_value || ''
  );
  const [ageError, setAgeError] = useState<string>('');
  const [minimumAge, setMinimumAge] = useState<number>(18);
  const { authState } = useAuth();
  
  // Phone input specific state - default to South Africa
  const [countryCode, setCountryCode] = useState<string>('+27');
  const [mobileValidation, setMobileValidation] = useState<{ isValid: boolean; message?: string }>({ 
    isValid: false 
  });

  // Address question specific state
  const [userCountryCode, setUserCountryCode] = useState<string>('');

  const isLocked = question.is_immutable && !!question.user_answer?.answer_value;
  
  // Calculate days until expiry
  const daysUntilExpiry = question.user_answer?.last_updated && question.decay_interval_days
    ? question.decay_interval_days - Math.floor(
        (Date.now() - new Date(question.user_answer.last_updated).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  // Fetch minimum age for user's country if this is a date_of_birth question
  useEffect(() => {
    if (question.question_key === 'date_of_birth' && authState.user?.id) {
      const fetchMinimumAge = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country_code')
          .eq('user_id', authState.user!.id)
          .single();

        const countryCode = profile?.country_code || 'GLOBAL';
        
        const { data: legalAge } = await supabase
          .from('country_legal_age')
          .select('minimum_age')
          .eq('country_code', countryCode)
          .single();

        if (legalAge) {
          setMinimumAge(legalAge.minimum_age);
        }
      };
      fetchMinimumAge();
    }
  }, [question.question_key, authState.user?.id]);
  
  // Fetch user's country code for address questions
  useEffect(() => {
    if (question.question_type === 'address' && authState.user?.id) {
      const fetchCountryCode = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('country_code, mobile')
          .eq('user_id', authState.user!.id)
          .single();

        if (error) {
          console.error('[QuestionRenderer] Error fetching profile:', error);
          return;
        }

        if (profile?.country_code) {
          console.log('[QuestionRenderer] User country code from profile:', profile.country_code);
          setUserCountryCode(profile.country_code);
        } else if (profile?.mobile) {
          // Fallback: Extract country code from mobile number
          // Mobile numbers are stored in E.164 format (e.g., "+27821234567")
          console.log('[QuestionRenderer] No country_code, extracting from mobile:', profile.mobile);
          
          // Match country code (1-4 digits after +)
          const match = profile.mobile.match(/^(\+\d{1,4})/);
          if (match) {
            const extractedCode = match[1];
            console.log('[QuestionRenderer] Extracted country code:', extractedCode);
            setUserCountryCode(extractedCode);
            
            // Update the profile with the extracted country code for future use
            supabase
              .from('profiles')
              .update({ country_code: extractedCode })
              .eq('user_id', authState.user!.id)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.error('[QuestionRenderer] Failed to update country_code:', updateError);
                } else {
                  console.log('[QuestionRenderer] Successfully updated country_code in profile');
                }
              });
          } else {
            console.error('[QuestionRenderer] Could not extract country code from mobile:', profile.mobile);
          }
        } else {
          console.error('[QuestionRenderer] No country_code or mobile found in profile');
        }
      };
      fetchCountryCode();
    }
  }, [question.question_type, authState.user?.id]);
  
  // Update the address value when userCountryCode is set
  useEffect(() => {
    if (question.question_type === 'address' && userCountryCode && !value?.country) {
      const countryName = getCountryNameFromDialCode(userCountryCode);
      if (countryName) {
        console.log('[QuestionRenderer] Setting country in value:', countryName);
        setValue(prev => ({
          ...prev,
          country: countryName
        }));
      }
    }
  }, [userCountryCode, question.question_type, value?.country]);
  
  // Validate phone number when value or country code changes
  useEffect(() => {
    if (question.question_type === 'phone' && value) {
      const validation = validateAndNormalizeMobile(value, countryCode);
      setMobileValidation({
        isValid: validation.isValid,
        message: validation.error
      });
    }
  }, [value, countryCode, question.question_type]);

  useEffect(() => {
    if (question.question_type === 'text' || question.question_type === 'email' || question.question_type === 'phone') {
      const timer = setTimeout(() => {
        if (value !== (question.user_answer?.answer_value || '')) {
          onAnswerChange(question.id, value);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [value, question.id, question.question_type, question.user_answer?.answer_value, onAnswerChange]);

  const handleChange = (newValue: any) => {
    // Validate age for date_of_birth questions
    if (question.question_key === 'date_of_birth' && newValue) {
      const birthDate = new Date(newValue);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;

      if (actualAge < minimumAge) {
        setAgeError(`You must be at least ${minimumAge} years old to register.`);
        return;
      } else {
        setAgeError('');
      }
    }
    
    setValue(newValue);
    if (question.question_type !== 'text' && question.question_type !== 'email' && question.question_type !== 'phone') {
      onAnswerChange(question.id, newValue);
    }
  };

  const renderInput = () => {
    switch (question.question_type) {
      case 'text':
      case 'email':
        return (
          <Input
            id={question.id}
            type={question.question_type === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder || ''}
            disabled={disabled || isLocked}
            className="w-full"
          />
        );
      
      case 'phone':
        const countries = getAllCountries();
        const formatInfo = getMobileFormatInfo(countryCode);
        
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select 
                value={countryCode} 
                onValueChange={setCountryCode}
                disabled={disabled || isLocked}
              >
                <SelectTrigger className="w-[140px] flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.dialCode}>
                      {formatCountryDisplay(country)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative flex-1">
                <Input
                  id={question.id}
                  type="tel"
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={formatInfo.example}
                  disabled={disabled || isLocked}
                  className={cn(
                    "pr-10",
                    value && mobileValidation.isValid && "border-green-500",
                    value && !mobileValidation.isValid && "border-destructive"
                  )}
                />
                {value && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {mobileValidation.isValid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
            </div>
            {formatInfo.hint && (
              <p className="text-xs text-muted-foreground">{formatInfo.hint}</p>
            )}
            {value && !mobileValidation.isValid && mobileValidation.message && (
              <p className="text-xs text-destructive">{mobileValidation.message}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder || ''}
            disabled={disabled || isLocked}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={handleChange} disabled={disabled || isLocked}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={question.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => {
                // Support both new structured format and legacy string format
                if (typeof option === 'string') {
                  return (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  );
                }
                return (
                  <SelectItem key={option.short_id || option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !value && 'text-muted-foreground'
                  )}
                  disabled={disabled || isLocked}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      handleChange(date.toISOString());
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {ageError && (
              <p className="text-sm text-destructive mt-1">{ageError}</p>
            )}
          </div>
        );

      case 'address':
        // Check if we have the required address fields
        // Province/State is required, country will be auto-filled from mobile number
        const hasRequiredAddressFields = value?.administrative_area_level_1 && userCountryCode;
        
        // Debug logging
        console.log('[QuestionRenderer] Address validation:', {
          hasProvince: !!value?.administrative_area_level_1,
          hasCountry: !!value?.country,
          hasUserCountryCode: !!userCountryCode,
          userCountryCode,
          value
        });
        
        return (
          <div className="space-y-4">
            <AddressFieldsInput
              value={question.user_answer?.answer_json || value}
              onChange={(address) => {
                console.log('[QuestionRenderer] Address changed:', address);
                setValue(address);
                if (onAddressChange) {
                  onAddressChange(address);
                }
              }}
              disabled={disabled || isLocked}
              userCountryCode={userCountryCode}
            />
            {!isLocked && (
              <Button
                onClick={() => {
                  console.log('[QuestionRenderer] Submitting address:', value);
                  onAnswerChange(question.id, value);
                }}
                disabled={disabled || !hasRequiredAddressFields}
                className="w-full"
                size="lg"
              >
                {!userCountryCode ? 'Loading country information...' : 
                 !value?.administrative_area_level_1 ? 'Please enter Province/State' :
                 'Continue to Next Question'}
              </Button>
            )}
          </div>
        );

      case 'boolean':
        return (
          <Switch
            id={question.id}
            checked={value === true || value === 'true'}
            onCheckedChange={handleChange}
            disabled={disabled || isLocked}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label htmlFor={question.id} className="flex items-center gap-2">
          {question.question_text}
          {question.is_required && <span className="text-destructive">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {isLocked && (
            <Badge variant="secondary" className="gap-1 flex-shrink-0">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </div>
      </div>
      {renderInput()}
      <div className="space-y-1">
        {question.help_text && (
          <p className="text-sm text-muted-foreground">{question.help_text}</p>
        )}
        {isLocked && (
          <p className="text-xs text-muted-foreground italic">
            This field is locked for data integrity. Contact support to update.
          </p>
        )}
      </div>
    </div>
  );
}
