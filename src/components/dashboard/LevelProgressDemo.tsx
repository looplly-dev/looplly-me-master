import { LevelProgressDial } from '@/components/ui/level-progress-dial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LevelProgressDemo() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-foreground">Your Progress</CardTitle>
            <p className="text-muted-foreground text-sm">
              Track your achievements and level advancement
            </p>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center space-y-6">
            <LevelProgressDial
              currentLevel={67}
              progress={67}
              pointsToNext={33}
              membershipTier="Premium Member"
              size="lg"
              maxLevel={100}
              showHelp={true}
            />
            
            {/* Additional Progress Info */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Keep earning points to unlock new features and rewards
              </p>
              <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span>• Higher earning rates</span>
                <span>• Exclusive opportunities</span>
                <span>• Priority support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}