import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Lock, Shield } from 'lucide-react';

interface Stage2CapAlertProps {
  earnedBadgesCount: number;
  requiredBadgesCount: number;
  missingBadgeNames: string[];
}

export function Stage2CapAlert({ 
  earnedBadgesCount, 
  requiredBadgesCount, 
  missingBadgeNames 
}: Stage2CapAlertProps) {
  const progress = (earnedBadgesCount / requiredBadgesCount) * 100;

  return (
    <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        🔒 Streak Capped at 29 Days
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-amber-800 dark:text-amber-200">
          To continue your streak beyond 29 days, complete {requiredBadgesCount} core verification badges.
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-700 dark:text-amber-300">Badge Progress</span>
            <span className="font-medium text-amber-900 dark:text-amber-100">
              {earnedBadgesCount}/{requiredBadgesCount} badges earned 🔓
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-amber-200 dark:bg-amber-900" />
        </div>

        {missingBadgeNames.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Missing Badges:
            </p>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 ml-4">
              {missingBadgeNames.map((name, index) => (
                <li key={index} className="list-disc">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}