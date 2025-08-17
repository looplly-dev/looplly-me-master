import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { requestPushPermissions } from '@/utils/pushNotifications';
import { User, MapPin } from 'lucide-react';

export default function ProfileSetup() {
  const [formData, setFormData] = useState({
    sec: '',
    gender: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    address: '',
    gpsEnabled: false,
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { completeProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Request push notification permission when profile setup loads
    const setupNotifications = async () => {
      try {
        const granted = await requestPushPermissions();
        if (granted) {
          toast({
            title: 'Notifications Enabled!',
            description: 'You\'ll receive instant survey alerts (+8 rep points)',
          });
        }
      } catch (error) {
        console.log('Push notifications not available in this environment');
      }
    };
    
    setupNotifications();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['sec', 'gender', 'address', 'firstName', 'lastName', 'dobDay', 'dobMonth', 'dobYear'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    // Construct date from day, month, year
    const dateOfBirth = new Date(
      parseInt(formData.dobYear),
      parseInt(formData.dobMonth) - 1, // Month is 0-indexed
      parseInt(formData.dobDay)
    );

    // Age validation removed

    setIsSubmitting(true);
    
    try {
      const success = await completeProfile({
        ...formData,
        dateOfBirth
      });
      
      if (success) {
        toast({
          title: 'Profile Complete!',
          description: 'Welcome to Looplly! You can now start earning.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete profile. Please check your information.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <p className="text-muted-foreground">
              Help us personalize your earning opportunities
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sec">SEC Classification *</Label>
                <Select value={formData.sec} onValueChange={(value) => setFormData({...formData, sec: value})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your SEC class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Upper Class</SelectItem>
                    <SelectItem value="B">B - Upper Middle Class</SelectItem>
                    <SelectItem value="C1">C1 - Lower Middle Class</SelectItem>
                    <SelectItem value="C2">C2 - Skilled Working Class</SelectItem>
                    <SelectItem value="D">D - Working Class</SelectItem>
                    <SelectItem value="E">E - Lower Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select" />
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
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Day</Label>
                      <Select value={formData.dobDay} onValueChange={(value) => setFormData({...formData, dobDay: value})}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Month</Label>
                      <Select value={formData.dobMonth} onValueChange={(value) => setFormData({...formData, dobMonth: value})}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Year</Label>
                      <Select value={formData.dobYear} onValueChange={(value) => setFormData({...formData, dobYear: value})}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Array.from({ length: new Date().getFullYear() - 1939 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Home Address *</Label>
                <Input
                  id="address"
                  placeholder="Your home address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="gps" className="font-medium">Enable GPS Location</Label>
                    <p className="text-xs text-muted-foreground">Boosts your rep score for location-based surveys</p>
                  </div>
                </div>
                <Switch
                  id="gps"
                  checked={formData.gpsEnabled}
                  onCheckedChange={(checked) => setFormData({...formData, gpsEnabled: checked})}
                />
              </div>

              <Button 
                type="submit" 
                variant="mobile" 
                size="mobile" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Setting Up Profile...' : 'Complete Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}