import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Calendar, 
  Target, 
  Clock,
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakProgressProps {
  currentStreak: number;
  longestStreak: number;
  daysUntilMonthlyMilestone: number;
  monthsUntilYearly: number;
  milestones: {
    weekly: { achieved: boolean; count: number };
    monthly: { achieved: boolean; count: number };
    quarterly: { achieved: boolean; count: number };
    yearly: { achieved: boolean; count: number };
  };
}

export function StreakProgress({ 
  currentStreak, 
  longestStreak, 
  daysUntilMonthlyMilestone, 
  monthsUntilYearly,
  milestones 
}: StreakProgressProps) {
  
  // Calculate streak reward based on current streak
  const getStreakReward = (streak: number) => {
    if (streak >= 30) return 25;
    if (streak >= 14) return 15;
    if (streak >= 7) return 10;
    return 5;
  };

  // Progress to next monthly milestone (every 30 days)
  const progressToMonthly = ((30 - daysUntilMonthlyMilestone) / 30) * 100;
  
  // Progress to yearly milestone (365 days total)
  const progressToYearly = (currentStreak / 365) * 100;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">
          Maintain your streak to earn bonus Rep and unlock exclusive milestone badges
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Current Streak Display */}
        <div className="text-center p-3 bg-background/50 dark:bg-background/70 rounded-lg border border-border/50">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary via-orange-500 to-primary bg-clip-text text-transparent mb-1">
            🔥 {currentStreak}
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Day Streak</p>
          <Badge className="bg-primary/20 text-primary border border-primary/30">
            +{getStreakReward(currentStreak)} Rep Today
          </Badge>
        </div>

        {/* Streak Stats */}
        <div className="text-center p-2 bg-secondary/30 dark:bg-secondary/40 rounded-lg border border-secondary/20 dark:border-secondary/30">
          <p className="text-lg font-bold text-foreground">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
        </div>

        {/* Monthly Progress */}
        <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              📅 <span>Monthly Milestone</span>
            </span>
            <Badge variant="outline" className="border-primary/30 text-primary">+50 Rep</Badge>
          </div>
          <Progress value={progressToMonthly} className="h-2.5" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{30 - daysUntilMonthlyMilestone} days done</span>
            <span className={cn(
              "font-medium",
              daysUntilMonthlyMilestone <= 7 ? "text-primary animate-pulse" : "text-muted-foreground"
            )}>
              {daysUntilMonthlyMilestone} days to go! 🎉
            </span>
          </div>
        </div>

        {/* Yearly Progress */}
        <div className="space-y-2 p-3 rounded-lg bg-purple/5 border border-purple/20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              🎯 <span>Annual Legend</span>
            </span>
            <Badge variant="outline" className="border-purple/30 text-purple">+500 Rep</Badge>
          </div>
          <Progress value={progressToYearly} className="h-2.5" />
          <p className="text-xs text-muted-foreground">
            {currentStreak} days done • {365 - currentStreak} days remaining
          </p>
        </div>

        {/* Milestone Badges */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Streak Milestones</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              'p-1.5 rounded border text-center',
              milestones.weekly.achieved 
                ? 'bg-success/10 border-success/30' 
                : 'bg-muted/30 border-border dark:bg-muted/20 dark:border-muted'
            )}>
              <p className="text-xs font-medium">⚡ Week Warrior</p>
              <p className="text-xs text-muted-foreground">
                {milestones.weekly.achieved ? `✓ Earned ${milestones.weekly.count}x` : '7 days to unlock'}
              </p>
            </div>
            
            <div className={cn(
              'p-1.5 rounded border text-center',
              milestones.monthly.achieved
                ? 'bg-accent/10 border-accent/30 dark:bg-accent/15 dark:border-accent/40' 
                : 'bg-muted/30 border-border dark:bg-muted/20 dark:border-muted'
            )}>
              <p className="text-xs font-medium">🌙 Month Master</p>
              <p className="text-xs text-muted-foreground">
                {milestones.monthly.achieved ? `✓ Earned ${milestones.monthly.count}x` : '30 days to unlock'}
              </p>
            </div>
            
            <div className={cn(
              'p-1.5 rounded border text-center',
              milestones.quarterly.achieved
                ? 'bg-info/10 border-info/30 dark:bg-info/15 dark:border-info/40' 
                : 'bg-muted/30 border-border dark:bg-muted/20 dark:border-muted'
            )}>
              <p className="text-xs font-medium">🌟 Quarter Champion</p>
              <p className="text-xs text-muted-foreground">
                {milestones.quarterly.achieved ? `✓ Earned ${milestones.quarterly.count}x` : '90 days to unlock'}
              </p>
            </div>
            
            <div className={cn(
              'p-1.5 rounded border text-center',
              milestones.yearly.achieved
                ? 'bg-purple/10 border-purple/30' 
                : 'bg-muted/30 border-border dark:bg-muted/20 dark:border-muted'
            )}>
              <p className="text-xs font-medium">👑 Annual Legend</p>
              <p className="text-xs text-muted-foreground">
                {milestones.yearly.achieved ? `✓ Earned ${milestones.yearly.count}x` : '365 days to unlock'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}