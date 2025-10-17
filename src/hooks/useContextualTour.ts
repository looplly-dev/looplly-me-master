import { useState, useEffect } from 'react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
}

export function useContextualTour(steps: TourStep[], storageKey: string) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const hasCompletedTour = localStorage.getItem(storageKey) === 'true';

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const completeTour = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    setCurrentStep(0);
  };

  const skipTour = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Auto-scroll to highlighted element
  useEffect(() => {
    if (!isActive) return;

    const currentStepData = steps[currentStep];
    const element = document.querySelector(currentStepData.targetSelector);
    
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentStep, isActive, steps]);

  return {
    isActive,
    currentStep,
    currentStepData: steps[currentStep],
    totalSteps: steps.length,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
    nextStep,
    previousStep,
  };
}
