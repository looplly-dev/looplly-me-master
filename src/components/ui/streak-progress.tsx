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

        {/* Next Milestone Progress - Circular Design */}
        <div className={cn("p-4 rounded-lg border", nextMilestone.colorClass)}>
          <div className="flex flex-col items-center gap-3">
            {/* Title - Centered Header */}
            <h4 className="font-bold text-xl text-foreground text-center">
              {nextMilestone.name}
            </h4>
            
            {/* Rep Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium",
                nextMilestone.colorClass
              )}
            >
              +{nextMilestone.reward} Rep
            </Badge>

            {/* Circular Progress */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-border"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - nextMilestone.progress / 100)}`}
                    className={nextMilestone.textClass}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Emoji in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">{nextMilestone.emoji}</span>
                </div>
              </div>
              
              {/* Day count below circle */}
              <p className="text-xs text-muted-foreground text-center">
                {currentStreak} / {nextMilestone.target} days
              </p>
            </div>

            {/* Days Remaining Message */}
            {nextMilestone.remaining > 0 ? (
              <p className={cn(
                "text-sm font-medium text-center",
                nextMilestone.remaining <= 7 ? `${nextMilestone.textClass} animate-pulse` : "text-foreground"
              )}>
                🎯 {nextMilestone.remaining} {nextMilestone.remaining === 1 ? 'day' : 'days'} to go!
              </p>
            ) : (
              <p className={cn("text-sm font-semibold text-center", nextMilestone.textClass)}>
                ✓ Completed! 🏆
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