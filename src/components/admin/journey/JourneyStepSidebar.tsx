import { CheckCircle, Circle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { journeySteps, useJourneyPreview } from '@/contexts/JourneyPreviewContext';

const categoryColors: Record<string, string> = {
  signup: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  profile: 'bg-green-500/20 text-green-700 dark:text-green-300',
  dashboard: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  earning: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  reputation: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
};

interface JourneyStepSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function JourneyStepSidebar({ collapsed, onToggleCollapse }: JourneyStepSidebarProps) {
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
    <div className={`${collapsed ? 'w-14' : 'w-64'} border-r bg-muted/30 flex flex-col transition-all duration-200`}>
      <div className="p-2 border-b bg-background flex items-center justify-between sticky top-0 z-10">
        {!collapsed && (
          <h3 className="font-semibold text-xs">
            Steps {currentIndex + 1}/{journeySteps.length}
          </h3>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 ml-auto"
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <TooltipProvider>
          <div className={`${collapsed ? 'p-1' : 'p-2'} space-y-1`}>
            {journeySteps.map((step, index) => {
              const isActive = step.id === currentStepId;
              const icon = getStepIcon(index);

              if (collapsed) {
                return (
                  <Tooltip key={step.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="icon"
                        className="w-full h-10"
                        onClick={() => setCurrentStepId(step.id)}
                      >
                        {icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{step.title}</div>
                        <Badge variant="outline" className={`text-xs ${categoryColors[step.category]}`}>
                          {step.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Button
                  key={step.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start text-left h-auto py-2 ${
                    isActive ? 'bg-primary/10 border-l-2 border-primary' : ''
                  }`}
                  onClick={() => setCurrentStepId(step.id)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <div className="mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-xs truncate">
                          {step.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryColors[step.category]}`}
                        >
                          {step.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </TooltipProvider>
      </ScrollArea>
    </div>
  );
}
