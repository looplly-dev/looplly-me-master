import { useState, useEffect } from 'react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
}

export function useContextualTour(steps: TourStep[], storageKey: string) {
  const [currentStep, setCurrentStep] = useState(0);

  const hasCompletedTour = localStorage.getItem(storageKey) === 'true';

  const completeTour = () => {
    localStorage.setItem(storageKey, 'true');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetTour = () => {
    setCurrentStep(0);
  };

  return {
    currentStep,
    currentStepData: steps[currentStep],
    totalSteps: steps.length,
    hasCompletedTour,
    completeTour,
    nextStep,
    previousStep,
    resetTour,
  };
}
