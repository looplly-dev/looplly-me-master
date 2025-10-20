import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { journeySteps, useJourneyPreview } from '@/contexts/JourneyPreviewContext';

const categoryColors: Record<string, string> = {
  signup: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  profile: 'bg-green-500/20 text-green-700 dark:text-green-300',
  dashboard: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  earning: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  reputation: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
};

export function JourneyStepSidebar() {
  const { currentStepId, setCurrentStepId } = useJourneyPreview();

  const currentIndex = journeySteps.findIndex(s => s.id === currentStepId);

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentIndex) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (stepIndex === currentIndex) {
      return <AlertCircle className="h-4 w-4 text-primary" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Journey Steps</h3>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} of {journeySteps.length}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {journeySteps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = index < currentIndex;

            return (
              <Button
                key={step.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start text-left h-auto py-3 ${
                  isActive ? 'bg-primary/10 border-l-2 border-primary' : ''
                }`}
                onClick={() => setCurrentStepId(step.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5">{getStepIcon(index)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {step.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoryColors[step.category]}`}
                      >
                        {step.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {step.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {step.component}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
