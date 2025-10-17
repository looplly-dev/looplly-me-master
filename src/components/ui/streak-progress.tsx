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
    <div className="space-y-3">
      {/* Next Milestone - Horizontal Bar */}
      <div className={cn("p-3 rounded-lg border", nextMilestone.colorClass)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{nextMilestone.emoji}</span>
            <div>
              <h4 className="font-bold text-sm">{nextMilestone.name}</h4>
              <p className="text-xs text-muted-foreground">{currentStreak}/{nextMilestone.target} days</p>
            </div>
          </div>
          <Badge className={cn("text-xs font-semibold", nextMilestone.badgeClass)}>
            +{nextMilestone.reward} Rep
          </Badge>
        </div>
        
        {/* Horizontal Progress Bar */}
        <div className="relative h-2 rounded-full overflow-hidden bg-border/30 dark:bg-border/20">
          <div 
            className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", nextMilestone.textClass)}
            style={{ 
              width: `${nextMilestone.progress}%`,
              backgroundColor: 'currentColor'
            }}
          />
        </div>
        
        {nextMilestone.remaining > 0 && (
          <p className="text-xs text-center mt-2 text-muted-foreground">
            🎯 {nextMilestone.remaining} day{nextMilestone.remaining !== 1 ? 's' : ''} to go!
          </p>
        )}
      </div>

      {/* Compact Milestone Badges - 4 Column */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className={cn(
          'p-1 rounded border text-center transition-all hover:scale-105',
          milestones.weekly.achieved 
            ? 'bg-success/10 border-success/30 dark:bg-success/20 dark:border-success/40' 
            : 'bg-muted/30 border-border dark:bg-muted/20'
        )}>
          <p className="text-lg">⚡</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {milestones.weekly.achieved ? `${milestones.weekly.count}x` : '7d'}
          </p>
        </div>
        
        <div className={cn(
          'p-1 rounded border text-center transition-all hover:scale-105',
          milestones.monthly.achieved
            ? 'bg-accent/10 border-accent/30 dark:bg-accent/20 dark:border-accent/40' 
            : 'bg-muted/30 border-border dark:bg-muted/20'
        )}>
          <p className="text-lg">🌙</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {milestones.monthly.achieved ? `${milestones.monthly.count}x` : '30d'}
          </p>
        </div>
        
        <div className={cn(
          'p-1 rounded border text-center transition-all hover:scale-105',
          milestones.quarterly.achieved
            ? 'bg-info/10 border-info/30 dark:bg-info/20 dark:border-info/40' 
            : 'bg-muted/30 border-border dark:bg-muted/20'
        )}>
          <p className="text-lg">🌟</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {milestones.quarterly.achieved ? `${milestones.quarterly.count}x` : '90d'}
          </p>
        </div>
        
        <div className={cn(
          'p-1 rounded border text-center transition-all hover:scale-105',
          milestones.yearly.achieved
            ? 'bg-purple/10 border-purple/30 dark:bg-purple/20 dark:border-purple/40' 
            : 'bg-muted/30 border-border dark:bg-muted/20'
        )}>
          <p className="text-lg">👑</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {milestones.yearly.achieved ? `${milestones.yearly.count}x` : '365d'}
          </p>
        </div>
      </div>
    </div>
  );
}