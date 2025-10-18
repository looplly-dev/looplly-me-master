import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Target, TrendingUp, CheckSquare, Trophy } from 'lucide-react';

interface RepOnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  isBetaCohort?: boolean;
}

export function RepOnboardingTour({ isVisible, onComplete, onSkip, isBetaCohort }: RepOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      title: "Welcome to Rep! 🎯",
      icon: Target,
      content: (
        <div className="space-y-4">
          <p className="text-base">Your Rep score unlocks rewards:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">💰</span>
              <span className="text-sm">Better paying surveys</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⚡</span>
              <span className="text-sm">Faster payment processing</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🎁</span>
              <span className="text-sm">Exclusive opportunities</span>
            </div>
          </div>
        </div>
      ),
      buttonText: "How does it work?"
    },
    {
      title: "Here's How It Works",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⬆️</span>
              <p className="text-sm font-medium">Do good things → Rep goes up</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⬇️</span>
              <p className="text-sm font-medium">Skip tasks or rush through → Rep goes down</p>
            </div>
          </div>
          <p className="text-base text-center font-semibold">It's that simple!</p>
        </div>
      ),
      buttonText: "What counts as 'good'?"
    },
    {
      title: "Build Your Rep By:",
      icon: CheckSquare,
      content: (
        <div className="space-y-3">
          <div className="bg-primary/10 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-sm">Completing surveys carefully</p>
              <p className="text-xs text-muted-foreground">Take your time, give honest answers</p>
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-sm">Check in daily</p>
              <p className="text-xs text-muted-foreground">Keep your streak alive</p>
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-semibold text-sm">Earning badges</p>
              <p className="text-xs text-muted-foreground">Complete achievements and milestones</p>
            </div>
          </div>
        </div>
      ),
      buttonText: "What happens as I level up?"
    },
    {
      title: "Your Journey Ahead",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <p className="text-base">You're starting at <span className="font-bold">Bronze 🥉</span></p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-lg">🥈</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Silver (100 Rep)</p>
                <p className="text-xs text-muted-foreground">More surveys available</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-lg">🥇</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Gold (250 Rep)</p>
                <p className="text-xs text-muted-foreground">Better pay rates</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-lg">💎</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Diamond (1000 Rep)</p>
                <p className="text-xs text-muted-foreground">Premium access</p>
              </div>
            </div>
          </div>

          {isBetaCohort && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-4">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                🎁 Founding Member Bonus
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                You start with special early access perks!
              </p>
            </div>
          )}
        </div>
      ),
      buttonText: "Start Building My Rep!"
    }
  ];

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipTour = () => {
    onSkip();
  };

  if (!isVisible) return null;

  const IconComponent = currentTourStep.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <IconComponent className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">{currentTourStep.title}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={skipTour}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            {currentTourStep.content}
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-center gap-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={nextStep}
            className="flex-1"
          >
            {currentTourStep.buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
