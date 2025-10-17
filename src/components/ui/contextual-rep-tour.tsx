import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useContextualTour, TourStep } from '@/hooks/useContextualTour';

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '🎯 Let\'s Explore Your Rep Dashboard',
    content: 'We\'ll walk through each section so you know exactly where everything is.',
    targetSelector: '[data-tour-step="page"]',
  },
  {
    id: 'rep-score',
    title: 'Your Reputation Score',
    content: 'This shows your current Rep level and tier. The higher your score, the better rewards you unlock!',
    targetSelector: '[data-tour-step="rep-score"]',
  },
  {
    id: 'tier-progression',
    title: 'Climb the Tiers',
    content: 'See all available tiers from Bronze to Elite. Each tier unlocks better opportunities and benefits.',
    targetSelector: '[data-tour-step="tier-progression"]',
  },
  {
    id: 'streak-progress',
    title: 'Build Your Streak',
    content: 'Daily logins boost your Rep. Keep your streak alive to earn bonus points!',
    targetSelector: '[data-tour-step="streak-progress"]',
  },
  {
    id: 'badges',
    title: 'Collect Badges',
    content: 'Earn badges by completing challenges. Each badge adds Rep points and shows off your achievements.',
    targetSelector: '[data-tour-step="badges"]',
  },
  {
    id: 'performance',
    title: 'Track Your Quality',
    content: 'Your survey quality affects your Rep. High consistency and completion rates mean faster growth!',
    targetSelector: '[data-tour-step="performance"]',
  },
  {
    id: 'action-plan',
    title: 'Quick Wins Available',
    content: 'These are your fastest paths to more Rep. Focus on high-priority actions first!',
    targetSelector: '[data-tour-step="action-plan"]',
  },
  {
    id: 'benefits',
    title: 'What You Unlock',
    content: 'See exactly what benefits you get at each Rep tier. More Rep = better rewards!',
    targetSelector: '[data-tour-step="benefits"]',
  },
];

interface ContextualRepTourProps {
  isActive: boolean;
  onStart: () => void;
  onComplete: () => void;
}

export function ContextualRepTour({ isActive, onStart, onComplete }: ContextualRepTourProps) {
  const {
    currentStep,
    currentStepData,
    totalSteps,
    completeTour,
    nextStep,
    previousStep,
    resetTour,
  } = useContextualTour(tourSteps, 'rep_contextual_tour_completed');

  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Dynamic position tracking with scroll and resize support
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const updatePosition = () => {
      const element = document.querySelector(currentStepData.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      }
    };

    // Initial position
    updatePosition();

    // Auto-scroll to element
    const element = document.querySelector(currentStepData.targetSelector);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    // Update on scroll (with capture to catch all scroll events)
    window.addEventListener('scroll', updatePosition, true);
    
    // Update on resize
    window.addEventListener('resize', updatePosition);
    
    // Continuous updates for smooth tracking during animations
    let rafId: number;
    const continuousUpdate = () => {
      updatePosition();
      rafId = requestAnimationFrame(continuousUpdate);
    };
    rafId = requestAnimationFrame(continuousUpdate);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      cancelAnimationFrame(rafId);
    };
  }, [currentStep, isActive, currentStepData]);

  const handleComplete = () => {
    completeTour();
    resetTour();
    onComplete();
  };

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      handleComplete();
    } else {
      nextStep();
    }
  };

  if (!isActive || !currentStepData) return null;

  return (
    <>
      {/* Dark backdrop with blur */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={handleComplete} />

      {/* Spotlight effect */}
      {highlightRect && (
        <div
          className="fixed z-[45] pointer-events-none"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            boxShadow: '0 0 0 4px hsl(var(--primary)), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Tour card */}
      <div className="fixed z-50 left-1/2 -translate-x-1/2 top-20 w-full max-w-md px-4">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">
                {currentStepData.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">{currentStepData.content}</p>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
            >
              Skip Tour
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
