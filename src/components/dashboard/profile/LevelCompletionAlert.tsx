import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LevelCompletionAlertProps {
  level2Complete: boolean;
  staleCount: number;
  completionPercentage?: number;
}

export const LevelCompletionAlert = ({
  level2Complete,
  staleCount,
  completionPercentage = 0
}: LevelCompletionAlertProps) => {
  const navigate = useNavigate();

  if (staleCount > 0 && level2Complete) {
    return (
      <Alert className="border-warning bg-warning/10">
        <AlertCircle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">Profile Data Outdated</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          {staleCount} profile {staleCount === 1 ? 'answer needs' : 'answers need'} updating to continue earning. 
          Please review and update stale information below.
        </AlertDescription>
      </Alert>
    );
  }

  if (!level2Complete) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive">Complete Your Profile to Start Earning</AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-muted-foreground">
            You need to complete all required Level 2 questions to access earning opportunities.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile Completion</span>
              <span className="font-bold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-success bg-success/10">
      <CheckCircle2 className="h-4 w-4 text-success" />
      <AlertTitle className="text-success flex items-center gap-2">
        🎉 Profile Level 2 Complete!
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Great job! Your profile is complete. Start earning now!
        </p>
        <Button 
          onClick={() => navigate('/earn')}
          size="sm"
          className="ml-4"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Go to Earn
        </Button>
      </AlertDescription>
    </Alert>
  );
};
