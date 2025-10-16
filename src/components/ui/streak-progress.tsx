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

  // Determine next milestone to show
  const getNextMilestone = () => {
    if (currentStreak < 7) {
      return {
        name: 'Week Warrior',
        emoji: '⚡',
        target: 7,
        reward: 25,
        progress: (currentStreak / 7) * 100,
        remaining: 7 - currentStreak,
        colorClass: 'bg-primary/5 border-primary/20',
        badgeClass: 'border-primary/30 text-primary',
        textClass: 'text-primary'
      };
    } else if (currentStreak < 30) {
      return {
        name: 'Monthly Master',
        emoji: '🌙',
        target: 30,
        reward: 50,
        progress: (currentStreak / 30) * 100,
        remaining: 30 - currentStreak,
        colorClass: 'bg-success/5 border-success/20',
        badgeClass: 'border-success/30 text-success',
        textClass: 'text-success'
      };
    } else if (currentStreak < 90) {
      return {
        name: 'Quarter Champion',
        emoji: '🌟',
        target: 90,
        reward: 150,
        progress: (currentStreak / 90) * 100,
        remaining: 90 - currentStreak,
        colorClass: 'bg-info/5 border-info/20',
        badgeClass: 'border-info/30 text-info',
        textClass: 'text-info'
      };
    } else if (currentStreak < 365) {
      return {
        name: 'Annual Legend',
        emoji: '👑',
        target: 365,
        reward: 500,
        progress: (currentStreak / 365) * 100,
        remaining: 365 - currentStreak,
        colorClass: 'bg-purple/5 border-purple/20',
        badgeClass: 'border-purple/30 text-purple',
        textClass: 'text-purple'
      };
    } else {
      return {
        name: 'Legendary Status',
        emoji: '🏆',
        target: 365,
        reward: 500,
        progress: 100,
        remaining: 0,
        colorClass: 'bg-purple/5 border-purple/20',
        badgeClass: 'border-purple/30 text-purple',
        textClass: 'text-purple'
      };
    }
  };

  const nextMilestone = getNextMilestone();

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

        {/* Next Milestone Progress */}
        <div className={cn("space-y-2 p-3 rounded-lg", nextMilestone.colorClass)}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              {nextMilestone.emoji} <span>Next: {nextMilestone.name}</span>
            </span>
            <Badge variant="outline" className={nextMilestone.badgeClass}>
              +{nextMilestone.reward} Rep
            </Badge>
          </div>
          <Progress value={nextMilestone.progress} className="h-2.5" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {currentStreak} / {nextMilestone.target} days
            </span>
            {nextMilestone.remaining > 0 ? (
              <span className={cn(
                "font-medium",
                nextMilestone.remaining <= 3 ? `${nextMilestone.textClass} animate-pulse` : "text-muted-foreground"
              )}>
                {nextMilestone.remaining} {nextMilestone.remaining === 1 ? 'day' : 'days'} to go! 🎉
              </span>
            ) : (
              <span className={cn("font-medium", nextMilestone.textClass)}>
                Completed! 🏆
              </span>
            )}
          </div>
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