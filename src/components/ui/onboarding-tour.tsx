import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  X, 
  Coins, 
  Star, 
  Wallet,
  User,
  Target
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Looplly! 🎉',
    description: 'Start earning money in minutes! Let me show you how.',
    icon: <Star className="h-6 w-6 text-warning" />
  },
  {
    id: 'balance',
    title: 'Your Balance',
    description: 'This shows your current earnings and progress to your first cashout at $5.',
    icon: <Coins className="h-6 w-6 text-primary" />
  },
  {
    id: 'daily-checkin',
    title: 'Free Daily Bonus',
    description: 'Tap here every day for instant $0.50! Build your streak for bonus rewards.',
    icon: <Target className="h-6 w-6 text-success" />
  },
  {
    id: 'earn-tasks',
    title: 'Start Earning',
    description: 'Complete simple tasks like surveys and videos. Most take just 2-5 minutes!',
    icon: <Star className="h-6 w-6 text-accent" />
  },
  {
    id: 'wallet',
    title: 'Cash Out Options',
    description: 'Withdraw to M-Pesa, PayPal, or buy airtime. Low minimums, fast payments!',
    icon: <Wallet className="h-6 w-6 text-success" />
  },
  {
    id: 'profile',
    title: 'Complete Profile',
    description: 'Add your details to unlock all earning opportunities and enable withdrawals.',
    icon: <User className="h-6 w-6 text-primary" />
  }
];

export function OnboardingTour({ isVisible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const skipTour = () => {
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className={`max-w-sm w-full border-primary/30 shadow-xl transform transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentTourStep.icon}
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tourSteps.length}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-3">{currentTourStep.title}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {currentTourStep.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={skipTour}
              className="flex-1"
            >
              Skip Tour
            </Button>
            <Button
              onClick={nextStep}
              className="flex-1"
            >
              {isLastStep ? 'Start Earning!' : 'Next'}
              {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}