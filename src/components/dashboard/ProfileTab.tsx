import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Edit3, 
  Car,
  GraduationCap,
  Briefcase,
  Smartphone,
  CreditCard,
  Home,
  Save,
  X
} from 'lucide-react';

export default function ProfileTab() {
  const { authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    carMake: '',
    education: '',
    occupation: '',
    networkProvider: '',
    banking: '',
    homeOwnership: '',
    householdIncome: '',
    maritalStatus: '',
    children: '',
    lifestyle: ''
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your demographic profile has been updated successfully.',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-20 md:pb-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Demographic Profile</h2>
              <p className="text-muted-foreground">Complete your profile for better survey targeting</p>
            </div>
            <Button
              variant={isEditing ? "destructive" : "outline"}
              size="sm"
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automotive & Transportation */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Car className="h-5 w-5" />
            Automotive & Transportation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          <div className="space-y-2">
            <Label htmlFor="carMake">Car Make/Brand</Label>
            <Select 
              value={formData.carMake} 
              onValueChange={(value) => setFormData({...formData, carMake: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your car make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toyota">Toyota</SelectItem>
                <SelectItem value="honda">Honda</SelectItem>
                <SelectItem value="nissan">Nissan</SelectItem>
                <SelectItem value="hyundai">Hyundai</SelectItem>
                <SelectItem value="ford">Ford</SelectItem>
                <SelectItem value="bmw">BMW</SelectItem>
                <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                <SelectItem value="audi">Audi</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="none">I don't own a car</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education & Career
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="education">Education Level</Label>
            <Select 
              value={formData.education} 
              onValueChange={(value) => setFormData({...formData, education: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate/PhD</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Select 
              value={formData.occupation} 
              onValueChange={(value) => setFormData({...formData, occupation: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your occupation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="healthcare">Healthcare Professional</SelectItem>
                <SelectItem value="teacher">Teacher/Educator</SelectItem>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="business">Business/Management</SelectItem>
                <SelectItem value="finance">Finance/Banking</SelectItem>
                <SelectItem value="retail">Retail/Sales</SelectItem>
                <SelectItem value="government">Government Employee</SelectItem>
                <SelectItem value="self-employed">Self-Employed</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Technology & Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Technology & Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="networkProvider">Main Network Provider</Label>
            <Select 
              value={formData.networkProvider} 
              onValueChange={(value) => setFormData({...formData, networkProvider: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your network provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smart">Smart Communications</SelectItem>
                <SelectItem value="globe">Globe Telecom</SelectItem>
                <SelectItem value="dito">DITO Telecommunity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Banking & Finance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Banking & Finance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banking">Primary Bank</Label>
            <Select 
              value={formData.banking} 
              onValueChange={(value) => setFormData({...formData, banking: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your primary bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bdo">BDO Unibank</SelectItem>
                <SelectItem value="bpi">Bank of the Philippine Islands</SelectItem>
                <SelectItem value="metrobank">Metrobank</SelectItem>
                <SelectItem value="unionbank">UnionBank</SelectItem>
                <SelectItem value="landbank">Land Bank</SelectItem>
                <SelectItem value="security-bank">Security Bank</SelectItem>
                <SelectItem value="rcbc">RCBC</SelectItem>
                <SelectItem value="pnb">Philippine National Bank</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="paymaya">PayMaya</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="householdIncome">Household Income Range</Label>
            <Select 
              value={formData.householdIncome} 
              onValueChange={(value) => setFormData({...formData, householdIncome: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="below-20k">Below ₱20,000</SelectItem>
                <SelectItem value="20k-40k">₱20,000 - ₱40,000</SelectItem>
                <SelectItem value="40k-60k">₱40,000 - ₱60,000</SelectItem>
                <SelectItem value="60k-100k">₱60,000 - ₱100,000</SelectItem>
                <SelectItem value="100k-200k">₱100,000 - ₱200,000</SelectItem>
                <SelectItem value="above-200k">Above ₱200,000</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle & Housing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Lifestyle & Housing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homeOwnership">Home Ownership</Label>
            <Select 
              value={formData.homeOwnership} 
              onValueChange={(value) => setFormData({...formData, homeOwnership: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select home ownership status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="own">Own</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="family-owned">Family Owned</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select 
              value={formData.maritalStatus} 
              onValueChange={(value) => setFormData({...formData, maritalStatus: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="in-relationship">In a Relationship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="children">Number of Children</Label>
            <Select 
              value={formData.children} 
              onValueChange={(value) => setFormData({...formData, children: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select number of children" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4+">4 or more</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Profile
        </Button>
      )}
    </div>
  );
}