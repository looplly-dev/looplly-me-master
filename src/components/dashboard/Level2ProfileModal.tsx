import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Level2ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function Level2ProfileModal({ open, onClose, onComplete }: Level2ProfileModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { authState } = useAuth();
  const supabase = getSupabaseClient();

  const [formData, setFormData] = useState({
    gender: '',
    address: '',
    ethnicity: '',
    householdIncome: '',
    personalIncome: '',
    sec: '',
    email: ''
  });

  const totalSteps = 6; // 6 required questions
  const progress = (step / totalSteps) * 100;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.gender || !formData.address || !formData.ethnicity || 
        !formData.householdIncome || !formData.personalIncome || !formData.sec) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = authState.user?.id;
      if (!userId) throw new Error('No user ID');

      // Get question IDs
      const { data: questions } = await supabase
        .from('profile_questions')
        .select('id, question_key')
        .in('question_key', ['gender', 'address', 'ethnicity', 'household_income', 'personal_income', 'sec']);

      if (!questions || questions.length === 0) {
        throw new Error('Profile questions not found');
      }

      // Map answers to questions
      const answers = [
        { key: 'gender', value: formData.gender },
        { key: 'address', value: formData.address },
        { key: 'ethnicity', value: formData.ethnicity },
        { key: 'household_income', value: formData.householdIncome },
        { key: 'personal_income', value: formData.personalIncome },
        { key: 'sec', value: formData.sec }
      ];

      // Insert answers
      for (const answer of answers) {
        const question = questions.find(q => q.question_key === answer.key);
        if (question) {
          await supabase
            .from('profile_answers')
            .upsert({
              user_id: userId,
              question_id: question.id,
              answer_value: answer.value,
              answer_normalized: answer.value,
              last_updated: new Date().toISOString(),
              is_stale: false
            }, {
              onConflict: 'user_id,question_id'
            });
        }
      }

      // Update profiles table with email and level_2_complete flag
      await supabase
        .from('profiles')
        .update({
          email: formData.email || null,
          level_2_complete: true,
          last_profile_update: new Date().toISOString()
        })
        .eq('user_id', userId);

      toast({
        title: 'Profile Complete!',
        description: 'Ready to verify your mobile and start earning!',
      });

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Question {step} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="Your home address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="h-12"
                required
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity *</Label>
              <Select value={formData.ethnicity} onValueChange={(value) => updateField('ethnicity', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black/African</SelectItem>
                  <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="mixed">Mixed/Multiple</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="householdIncome">Household Income (Total) *</Label>
              <Select value={formData.householdIncome} onValueChange={(value) => updateField('householdIncome', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select household income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50000">R0 - R50,000</SelectItem>
                  <SelectItem value="50000-100000">R50,000 - R100,000</SelectItem>
                  <SelectItem value="100000-200000">R100,000 - R200,000</SelectItem>
                  <SelectItem value="200000-500000">R200,000 - R500,000</SelectItem>
                  <SelectItem value="500000+">R500,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <Label htmlFor="personalIncome">Personal Income (Your individual income) *</Label>
              <Select value={formData.personalIncome} onValueChange={(value) => updateField('personalIncome', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select personal income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-30000">R0 - R30,000</SelectItem>
                  <SelectItem value="30000-60000">R30,000 - R60,000</SelectItem>
                  <SelectItem value="60000-120000">R60,000 - R120,000</SelectItem>
                  <SelectItem value="120000-300000">R120,000 - R300,000</SelectItem>
                  <SelectItem value="300000+">R300,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sec">SEC (Socio-Economic Class) *</Label>
                <Select value={formData.sec} onValueChange={(value) => updateField('sec', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select SEC" />
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
                <Label htmlFor="email">
                  Email <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com (optional)"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!formData[Object.keys(formData)[step - 1]]}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
