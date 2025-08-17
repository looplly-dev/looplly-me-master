// Profile-specific operations hook
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/utils/profile';
import { validateProfile, ProfileData } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';

export const useProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { authState } = useAuth();

  const completeProfile = async (profileData: ProfileData): Promise<boolean> => {
    if (!authState.user?.id) {
      toast({
        title: "Error",
        description: "No user session found. Please log in again.",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Validate profile data
      const validation = validateProfile(profileData);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return false;
      }

      // Update profile in database
      const success = await updateUserProfile(authState.user.id, profileData);
      
      if (success) {
        toast({
          title: "Profile completed!",
          description: "Welcome to Looplly! Your profile has been set up successfully.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to complete profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completeProfile,
    isSubmitting
  };
};