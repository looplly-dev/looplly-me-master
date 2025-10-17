import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { Info } from 'lucide-react';

interface ReputationOnboardingProps {
  open: boolean;
  onClose: () => void;
  isBetaCohort: boolean;
  betaRepCap: number;
}

export function ReputationOnboarding({ 
  open, 
  onClose, 
  isBetaCohort, 
  betaRepCap 
}: ReputationOnboardingProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Welcome to Reputation System
          </DialogTitle>
          <DialogDescription>
            Your Reputation score unlocks surveys, faster payouts, and exclusive benefits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Beta Cohort Notice */}
          {isBetaCohort && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Beta Member</Badge>
                <span className="text-sm font-medium">You're in the Beta Cohort!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                As a Beta member, you have a soft cap at <strong>{betaRepCap} Rep</strong>. 
                After 500 Rep, gains gradually decrease to maintain fairness. Post-Beta users won't have this cap.
              </p>
            </div>
          )}

          {/* How Rep Works */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">How Reputation Works:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">+</span>
                <span><strong>Gain Rep:</strong> Complete surveys, maintain streaks, earn badges</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 dark:text-red-400 font-bold">-</span>
                <span><strong>Lose Rep:</strong> Rejected surveys, broken streaks, poor quality</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">📊</span>
                <span><strong>Quality Metrics:</strong> Track consistency, speed, and accuracy</span>
              </li>
            </ul>
          </div>

          {/* Tier Progression */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Tier Progression:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">Bronze (0-99)</div>
              <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded">Silver (100-249)</div>
              <div className="p-2 bg-yellow-200 dark:bg-yellow-900/30 rounded">Gold (250-499)</div>
              <div className="p-2 bg-purple-200 dark:bg-purple-900/30 rounded">Platinum (500-999)</div>
              <div className="p-2 bg-cyan-200 dark:bg-cyan-900/30 rounded">Diamond (1000-1999)</div>
              <div className="p-2 bg-orange-200 dark:bg-orange-900/30 rounded">Elite (2000+)</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Got it! Let's Build My Reputation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
