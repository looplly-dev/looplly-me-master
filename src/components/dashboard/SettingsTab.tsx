import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { userStats } from '@/mock_data';
import { 
  User, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Trash2,
  Save,
  X
} from 'lucide-react';

export default function ProfileTab() {
  const { authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: authState.user?.firstName || '',
    lastName: authState.user?.lastName || '',
    email: authState.user?.email || '',
    address: authState.user?.profile?.address || '',
    gender: authState.user?.profile?.gender || '',
    dateOfBirth: authState.user?.profile?.dateOfBirth || null,
    sec: authState.user?.profile?.sec || '',
    gpsEnabled: authState.user?.profile?.gpsEnabled || false
  });
  const { toast } = useToast();

  const handleSave = () => {
    // Mock save functionality
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      firstName: authState.user?.firstName || '',
      lastName: authState.user?.lastName || '',
      email: authState.user?.email || '',
      address: authState.user?.profile?.address || '',
      gender: authState.user?.profile?.gender || '',
      dateOfBirth: authState.user?.profile?.dateOfBirth || null,
      sec: authState.user?.profile?.sec || '',
      gpsEnabled: authState.user?.profile?.gpsEnabled || false
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account Deletion',
      description: 'Account deletion request submitted. You will receive confirmation via email.',
      variant: 'destructive'
    });
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {authState.user?.firstName} {authState.user?.lastName}
              </h2>
              <p className="text-muted-foreground">{authState.user?.mobile}</p>
              <p className="text-sm text-muted-foreground">
                Member since January 2024
              </p>
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

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                disabled={!isEditing}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={!isEditing}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({...formData, gender: value})}
                disabled={!isEditing}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                {formData.dateOfBirth 
                  ? new Date(formData.dateOfBirth).toLocaleDateString() 
                  : 'Not set'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sec">SEC Classification</Label>
            <Select 
              value={formData.sec} 
              onValueChange={(value) => setFormData({...formData, sec: value})}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
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

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={!isEditing}
              className="h-12"
            />
          </div>

          {isEditing && (
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Mobile Number</p>
                <p className="text-sm text-muted-foreground">
                  {authState.user?.countryCode} {authState.user?.mobile}
                </p>
              </div>
            </div>
            <Shield className="h-4 w-4 text-success" />
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Email Address</p>
                <p className="text-sm text-muted-foreground">
                  {authState.user?.email || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Communication & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">GPS Location (+10 rep)</p>
                <p className="text-xs text-muted-foreground">Location-based surveys</p>
              </div>
            </div>
            <Switch checked={formData.gpsEnabled} disabled={!isEditing} />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="text-lg">📱</div>
              <div>
                <p className="font-medium text-sm">SMS Notifications (+5 rep)</p>
                <p className="text-xs text-muted-foreground">Survey invitations via SMS</p>
              </div>
            </div>
            <Switch checked={true} disabled={!isEditing} />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="text-lg">💬</div>
              <div>
                <p className="font-medium text-sm">WhatsApp (+5 rep)</p>
                <p className="text-xs text-muted-foreground">Quick surveys via WhatsApp</p>
              </div>
            </div>
            <Switch checked={false} disabled={!isEditing} />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Email Updates (+3 rep)</p>
                <p className="text-xs text-muted-foreground">Weekly earnings summary</p>
              </div>
            </div>
            <Switch checked={true} disabled={!isEditing} />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="text-lg">🔔</div>
              <div>
                <p className="font-medium text-sm">Push Notifications (+8 rep)</p>
                <p className="text-xs text-muted-foreground">Instant survey alerts</p>
              </div>
            </div>
            <Switch checked={userStats.permissions.pushNotifications} disabled={!isEditing} />
          </div>
        </CardContent>
      </Card>

      {/* Crypto Verification */}
      <Card className="border-crypto/50 bg-crypto/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="text-lg">₿</div>
            Soulbase Crypto Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Verify your identity with Soulbase crypto token for enhanced reputation and premium opportunities.
          </p>
          <Button variant="outline" className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Connect Soulbase Token (+50 rep)
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account will permanently remove all your data and cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}