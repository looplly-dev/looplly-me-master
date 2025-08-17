import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Phone, Bell, Mail } from 'lucide-react';

interface CommunicationPreferencesProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function CommunicationPreferences({ onBack, onComplete }: CommunicationPreferencesProps) {
  const [preferences, setPreferences] = useState({
    sms: false,
    whatsapp: false,
    push: false,
    email: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCommunicationPreferences } = useAuth();
  const { toast } = useToast();

  const handlePreferenceChange = (type: keyof typeof preferences, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [type]: checked }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await updateCommunicationPreferences(preferences);
      if (success) {
        toast({
          title: "Communication preferences saved",
          description: "Your preferences have been updated successfully.",
        });
        onComplete();
      } else {
        toast({
          title: "Error",
          description: "Failed to save communication preferences. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const communicationOptions = [
    {
      key: 'sms' as const,
      icon: Phone,
      title: 'SMS',
      description: 'Receive text messages for important updates and opportunities',
      repPoints: '+2 Rep Points for enabling'
    },
    {
      key: 'whatsapp' as const,
      icon: MessageSquare,
      title: 'WhatsApp',
      description: 'Get notifications through WhatsApp for instant updates',
      repPoints: '+3 Rep Points for enabling'
    },
    {
      key: 'push' as const,
      icon: Bell,
      title: 'Push Notifications',
      description: 'Receive push notifications on your device',
      repPoints: '+2 Rep Points for enabling'
    },
    {
      key: 'email' as const,
      icon: Mail,
      title: 'Email',
      description: 'Get detailed updates and newsletters via email',
      repPoints: '+1 Rep Point for enabling'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Communication Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose how you'd like to receive updates and earning opportunities. 
            Each option contributes to your reputation points!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {communicationOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div key={option.key} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id={option.key}
                  checked={preferences[option.key]}
                  onCheckedChange={(checked) => handlePreferenceChange(option.key, checked as boolean)}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <label
                      htmlFor={option.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.title}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {option.repPoints}
                  </p>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Saving..." : "Continue to Verification"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}