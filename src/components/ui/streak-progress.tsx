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
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Daily Streak Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Current Streak Display */}
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <div className="text-3xl font-bold text-primary mb-1">
            {currentStreak}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
          <Badge className="bg-primary/10 text-primary">
            +{getStreakReward(currentStreak)} Rep Today
          </Badge>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-secondary/30 rounded-lg">
            <p className="text-lg font-bold text-foreground">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
          <div className="text-center p-2 bg-warning/10 rounded-lg">
            <p className="text-lg font-bold text-warning">{daysUntilMonthlyMilestone}</p>
            <p className="text-xs text-muted-foreground">Days to Monthly</p>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Monthly Milestone
            </span>
            <span className="font-medium">+50 Rep</span>
          </div>
          <Progress value={progressToMonthly} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {daysUntilMonthlyMilestone} days until bonus
          </p>
        </div>

        {/* Yearly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Annual Legend
            </span>
            <span className="font-medium">+500 Rep</span>
          </div>
          <Progress value={progressToYearly} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {365 - currentStreak} days until badge
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
                : 'bg-gray-50 border-gray-200'
            )}>
              <p className="text-xs font-medium">Week Warrior</p>
              <p className="text-xs text-muted-foreground">
                {milestones.weekly.achieved ? `✓ ${milestones.weekly.count}x` : 'Locked'}
              </p>
            </div>
            
            <div className={cn(
              'p-1.5 rounded border text-center',
              milestones.monthly.achieved
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-gray-50 border-gray-200'
            )}>
              <p className="text-xs font-medium">Month Master</p>
              <p className="text-xs text-muted-foreground">
                {milestones.monthly.achieved ? `✓ ${milestones.monthly.count}x` : 'Locked'}
              </p>
            </div>
            
            <div className={cn(
              'p-1.5 rounded border text-center',
              milestones.quarterly.achieved
                ? 'bg-warning/10 border-warning/30' 
                : 'bg-gray-50 border-gray-200'
            )}>
              <p className="text-xs font-medium">Quarter Champion</p>
              <p className="text-xs text-muted-foreground">
                {milestones.quarterly.achieved ? `✓ ${milestones.quarterly.count}x` : 'Locked'}
              </p>
            </div>
            
            <div className={cn(
              'p-1.5 rounded border text-center',
              milestones.yearly.achieved
                ? 'bg-purple/10 border-purple/30' 
                : 'bg-gray-50 border-gray-200'
            )}>
              <p className="text-xs font-medium">Annual Legend</p>
              <p className="text-xs text-muted-foreground">
                {milestones.yearly.achieved ? `✓ ${milestones.yearly.count}x` : 'Locked'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}