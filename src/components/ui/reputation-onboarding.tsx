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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6 p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            🎯 Welcome to Your Rep Score!
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Build your reputation to unlock better surveys and faster payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          {/* Founding Member Notice */}
          {isBetaCohort && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl sm:text-2xl">🎁</span>
                <div>
                  <Badge variant="secondary" className="mb-1">Founding Member</Badge>
                  <p className="text-sm font-semibold">You're one of our first users!</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>You start earning Rep immediately</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>After 500 Rep, new points count for less (but still count!)</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>This protects your early advantage as new users join</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>All your points are permanent</strong> - never lost!</span>
                </li>
              </ul>
            </div>
          )}

          {/* How Rep Works */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">How Your Rep Works:</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 items-start">
                <span className="text-xl">✅</span>
                <div>
                  <strong>Earn Points:</strong>
                  <p className="text-muted-foreground">Complete surveys, keep daily streaks, unlock badges</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-xl">❌</span>
                <div>
                  <strong>Lose Points:</strong>
                  <p className="text-muted-foreground">Skipped surveys, inconsistent answers</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-xl">📊</span>
                <div>
                  <strong>Track Progress:</strong>
                  <p className="text-muted-foreground">Watch your quality score improve over time</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Tier Progression */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm sm:text-base">Your Journey:</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
              <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:shadow-sm transition-shadow">
                <div className="text-xl sm:text-2xl mb-1">🥉</div>
                <div className="font-medium">Bronze</div>
                <div className="text-xs text-muted-foreground">0-99 Rep</div>
              </div>
              <div className="p-2 sm:p-3 bg-gray-200 dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow">
                <div className="text-xl sm:text-2xl mb-1">🥈</div>
                <div className="font-medium">Silver</div>
                <div className="text-xs text-muted-foreground">100-249 Rep</div>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-200 dark:bg-yellow-900/30 rounded-lg hover:shadow-sm transition-shadow">
                <div className="text-xl sm:text-2xl mb-1">🥇</div>
                <div className="font-medium">Gold</div>
                <div className="text-xs text-muted-foreground">250-499 Rep</div>
              </div>
              <div className="p-2 sm:p-3 bg-purple-200 dark:bg-purple-900/30 rounded-lg hover:shadow-sm transition-shadow">
                <div className="text-xl sm:text-2xl mb-1">⭐</div>
                <div className="font-medium">Platinum</div>
                <div className="text-xs text-muted-foreground">500-999 Rep</div>
              </div>
              <div className="p-2 sm:p-3 bg-cyan-200 dark:bg-cyan-900/30 rounded-lg hover:shadow-sm transition-shadow">
                <div className="text-xl sm:text-2xl mb-1">💎</div>
                <div className="font-medium">Diamond</div>
                <div className="text-xs text-muted-foreground">1000-1999 Rep</div>
              </div>
              <div className="p-2 sm:p-3 bg-orange-200 dark:bg-orange-900/30 rounded-lg hover:shadow-sm transition-shadow">
                <div className="text-xl sm:text-2xl mb-1">👑</div>
                <div className="font-medium">Elite</div>
                <div className="text-xs text-muted-foreground">2000+ Rep</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full text-sm sm:text-base py-4 sm:py-6">
            Got it! Let's Start Earning 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
