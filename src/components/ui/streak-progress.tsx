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
        colorClass: 'bg-primary/10 border-primary/40 dark:bg-primary/15 dark:border-primary/50',
        badgeClass: 'bg-primary/20 border-primary/40 text-primary font-semibold',
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
        colorClass: 'bg-success/10 border-success/40 dark:bg-success/15 dark:border-success/50',
        badgeClass: 'bg-success/20 border-success/40 text-success font-semibold',
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
        colorClass: 'bg-info/10 border-info/40 dark:bg-info/15 dark:border-info/50',
        badgeClass: 'bg-info/20 border-info/40 text-info font-semibold',
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
        colorClass: 'bg-purple/10 border-purple/40 dark:bg-purple/15 dark:border-purple/50',
        badgeClass: 'bg-purple/20 border-purple/40 text-purple font-semibold',
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
        colorClass: 'bg-purple/10 border-purple/40 dark:bg-purple/15 dark:border-purple/50',
        badgeClass: 'bg-purple/20 border-purple/40 text-purple font-semibold',
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

        {/* Next Milestone Progress - Dot Path Timeline */}
        <div className={cn("space-y-4 p-4 rounded-lg border", nextMilestone.colorClass)}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{nextMilestone.emoji}</span>
              <div>
                <h4 className="font-semibold text-base text-foreground">
                  {nextMilestone.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Next milestone unlocks at {nextMilestone.target} days
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(nextMilestone.badgeClass, "flex-shrink-0")}
            >
              +{nextMilestone.reward} Rep
            </Badge>
          </div>

          {/* Dot Path Progress */}
          <div className="relative py-4">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted/30 rounded-full -translate-y-1/2" />
            <div 
              className={cn("absolute left-0 top-1/2 h-1 rounded-full -translate-y-1/2 transition-all duration-500", nextMilestone.textClass)}
              style={{ width: `${nextMilestone.progress}%` }}
            />
            
            {/* Progress Dots */}
            <div className="relative flex justify-between items-center">
              {/* Start Dot */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 bg-background",
                  currentStreak > 0 ? `border-current ${nextMilestone.textClass}` : "border-muted"
                )}>
                  {currentStreak > 0 && (
                    <div className={cn("w-full h-full rounded-full", nextMilestone.textClass)} />
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">0</span>
              </div>

              {/* Mid-Checkpoint Dot (25%) */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 bg-background",
                  nextMilestone.progress >= 25 ? `border-current ${nextMilestone.textClass}` : "border-muted"
                )}>
                  {nextMilestone.progress >= 25 && (
                    <div className={cn("w-full h-full rounded-full scale-75", nextMilestone.textClass)} />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{Math.floor(nextMilestone.target * 0.25)}</span>
              </div>

              {/* Mid-Checkpoint Dot (50%) */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 bg-background",
                  nextMilestone.progress >= 50 ? `border-current ${nextMilestone.textClass}` : "border-muted"
                )}>
                  {nextMilestone.progress >= 50 && (
                    <div className={cn("w-full h-full rounded-full scale-75", nextMilestone.textClass)} />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{Math.floor(nextMilestone.target * 0.5)}</span>
              </div>

              {/* Mid-Checkpoint Dot (75%) */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 bg-background",
                  nextMilestone.progress >= 75 ? `border-current ${nextMilestone.textClass}` : "border-muted"
                )}>
                  {nextMilestone.progress >= 75 && (
                    <div className={cn("w-full h-full rounded-full scale-75", nextMilestone.textClass)} />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{Math.floor(nextMilestone.target * 0.75)}</span>
              </div>

              {/* End Dot (Target) */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center",
                  nextMilestone.progress >= 100 ? `border-current ${nextMilestone.textClass}` : "border-muted"
                )}>
                  {nextMilestone.progress >= 100 ? (
                    <span className="text-xs">🏆</span>
                  ) : (
                    <div className={cn("w-2 h-2 rounded-full", nextMilestone.progress >= 100 ? nextMilestone.textClass : "bg-muted")} />
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{nextMilestone.target}</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            {nextMilestone.remaining > 0 ? (
              <p className={cn(
                "text-sm font-semibold",
                nextMilestone.remaining <= 7 ? `${nextMilestone.textClass} animate-pulse` : "text-foreground"
              )}>
                🎯 {nextMilestone.remaining} {nextMilestone.remaining === 1 ? 'day' : 'days'} until you unlock this milestone!
              </p>
            ) : (
              <p className={cn("text-sm font-bold", nextMilestone.textClass)}>
                🏆 Milestone Completed! Amazing work!
              </p>
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