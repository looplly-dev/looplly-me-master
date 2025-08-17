import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding_completed');
    setHasCompletedOnboarding(!!completed);
    
    // Show onboarding for new users after a brief delay
    if (!completed) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setHasCompletedOnboarding(false);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    hasCompletedOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}