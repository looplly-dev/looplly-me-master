import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface MultiStepProfileSetupProps {
  onBack: () => void;
  onComplete: () => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  householdIncome: string;
  ethnicity: string;
  sec: string;
}

export default function MultiStepProfileSetup({ onBack, onComplete }: MultiStepProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    householdIncome: '',
    ethnicity: '',
    sec: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { completeProfile } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.gender || !profileData.dateOfBirth) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await completeProfile(profileData);
      if (success) {
        toast({
          title: "Profile completed!",
          description: "Welcome to Looplly! Your profile has been set up successfully.",
        });
        onComplete();
      } else {
        toast({
          title: "Age Restriction",
          description: "You must be at least 16 years old to use this platform.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gender">Gender *</Label>
        <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={profileData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={profileData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter your address"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="householdIncome">Household Income (Optional)</Label>
        <Select value={profileData.householdIncome} onValueChange={(value) => handleInputChange('householdIncome', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select income range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-25k">Under $25,000</SelectItem>
            <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
            <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
            <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
            <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
            <SelectItem value="over-150k">Over $150,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ethnicity">Ethnicity (Optional)</Label>
        <Select value={profileData.ethnicity} onValueChange={(value) => handleInputChange('ethnicity', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your ethnicity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="black">Black or African American</SelectItem>
            <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
            <SelectItem value="asian">Asian</SelectItem>
            <SelectItem value="native-american">Native American</SelectItem>
            <SelectItem value="pacific-islander">Pacific Islander</SelectItem>
            <SelectItem value="mixed">Mixed Race</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sec">Socio-Economic Classification</Label>
        <Select value={profileData.sec} onValueChange={(value) => handleInputChange('sec', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select SEC category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A - Higher managerial, administrative, professional</SelectItem>
            <SelectItem value="B">B - Intermediate managerial, administrative, professional</SelectItem>
            <SelectItem value="C1">C1 - Supervisory, clerical, junior managerial</SelectItem>
            <SelectItem value="C2">C2 - Skilled manual workers</SelectItem>
            <SelectItem value="D">D - Semi-skilled and unskilled manual workers</SelectItem>
            <SelectItem value="E">E - Unemployed, students, pensioners, casual workers</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrevious}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">
              Complete Your Profile ({currentStep}/2)
            </CardTitle>
          </div>
          <CardDescription>
            {currentStep === 1 
              ? "Let's start with your basic information"
              : "Help us understand your background better"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 ? renderStep1() : renderStep2()}
          
          <div className="flex gap-2">
            {currentStep < 2 ? (
              <Button onClick={handleNext} className="w-full">
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Completing Profile..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}