import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Flame, 
  Calendar, 
  Target, 
  Clock,
  TrendingUp,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakProgressProps {
  currentStreak: number;
  longestStreak: number;
  daysUntilMonthlyMilestone: number;
  monthsUntilYearly: number;
  milestones: {
    weekly: { achieved: boolean };
    monthly: { achieved: boolean };
    quarterly: { achieved: boolean };
    yearly: { achieved: boolean };
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
    <div className="p-2 sm:p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/40">
      <p className="text-xs text-muted-foreground mb-2 text-center hidden sm:block">
        Earn bonus Rep and unlock milestone badges
      </p>
      
      <div className="space-y-2 sm:space-y-3">
        {/* Hero Stats - Unified Card */}
        <div className="relative p-3 sm:p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {/* Left: Current Streak */}
            <div className="flex flex-col items-center flex-[3] w-full sm:w-auto">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="text-5xl">🔥</div>
                <div className="text-3xl font-bold text-orange-400">{currentStreak}</div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground/90 mb-1.5 sm:mb-2">Day Streak</p>
              <Badge className="bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-400/30 text-xs font-semibold">
                +{getStreakReward(currentStreak)} Rep Today
              </Badge>
            </div>
            
            {/* Right: Longest Streak */}
          <div className="flex flex-col items-center flex-[1] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700/50 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
            <div className="text-2xl font-bold text-foreground/80 mb-1">{longestStreak}</div>
            <p className="text-xs text-muted-foreground/80">Longest Streak</p>
          </div>
          </div>
        </div>

        {/* Next Milestone - Prominent Card */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-purple-900/40 rounded-xl border-2 border-blue-200 dark:border-blue-400/30">
          {/* Title */}
          <h4 className="font-bold text-lg sm:text-2xl text-foreground text-center mb-1.5 sm:mb-2">
            {nextMilestone.name}
          </h4>
          
          {/* Rep Badge - Centered */}
          <div className="flex justify-center mb-2 sm:mb-4">
            <Badge className="bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/30 dark:text-blue-200 dark:border-blue-400/40 text-sm font-semibold px-4 py-1">
              +{nextMilestone.reward} Rep
            </Badge>
          </div>

          {/* Circular Progress - Larger */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="relative">
              <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 128 128">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200 dark:text-slate-700/50"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - nextMilestone.progress / 100)}`}
                  className="text-blue-500 dark:text-blue-400"
                  strokeLinecap="round"
                />
              </svg>
              {/* Emoji in center - larger */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl">{nextMilestone.emoji}</span>
              </div>
            </div>
          </div>

          {/* Days Remaining */}
          {nextMilestone.remaining > 0 ? (
            <div className="text-center mt-2 sm:mt-4">
              <p className="text-sm sm:text-base font-semibold text-pink-600 dark:text-pink-300 flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl">🎯</span>
                {nextMilestone.remaining} day{nextMilestone.remaining !== 1 ? 's' : ''} to go!
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 italic">
                to your next milestone
              </p>
            </div>
          ) : (
            <div className="text-center mt-2 sm:mt-4">
              <p className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-300 flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl">✓</span> Completed! <span className="text-xl sm:text-2xl">🏆</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 italic">
                Keep going to reach the next level!
              </p>
            </div>
          )}
        </div>

        {/* Milestone Grid */}
          <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-foreground">Streak Milestones</h4>
              <Badge className="bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5">
                Year 1
              </Badge>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 dark:text-slate-300 transition-colors"
                    aria-label="Milestone information"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] p-3 bg-slate-800 border-slate-700">
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white">One-time achievements:</strong> Each milestone badge can only be earned once based on your longest streak ever. Once earned, they stay with you forever—even if your streak resets. New milestone badges will be released in Year 2!
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Week Warrior */}
            <div className={cn(
              'p-2 sm:p-3 rounded-lg border text-left transition-all duration-300',
              milestones.weekly.achieved 
                ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-500/40' 
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40'
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">⚡</span>
                <p className="text-sm font-semibold text-foreground">Week Warrior</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {milestones.weekly.achieved ? (
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white font-bold shadow-md">
                    ✓
                  </div>
                ) : (
                  '7 days to unlock'
                )}
              </div>
            </div>
            
            {/* Month Master */}
            <div className={cn(
              'p-2 sm:p-3 rounded-lg border text-left transition-all duration-300',
              milestones.monthly.achieved
                ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-500/40' 
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40'
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🌙</span>
                <p className="text-sm font-semibold text-foreground">Month Master</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {milestones.monthly.achieved ? (
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white font-bold shadow-md">
                    ✓
                  </div>
                ) : (
                  '30 days to unlock'
                )}
              </div>
            </div>
            
            {/* Quarter Champion */}
            <div className={cn(
              'p-2 sm:p-3 rounded-lg border text-left transition-all duration-300',
              milestones.quarterly.achieved
                ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-500/40' 
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40'
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🌟</span>
                <p className="text-sm font-semibold text-foreground">Quarter Champion</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {milestones.quarterly.achieved ? (
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white font-bold shadow-md">
                    ✓
                  </div>
                ) : (
                  '90 days to unlock'
                )}
              </div>
            </div>
            
            {/* Annual Legend */}
            <div className={cn(
              'p-2 sm:p-3 rounded-lg border text-left transition-all duration-300',
              milestones.yearly.achieved
                ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-500/40' 
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40'
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔥</span>
                <p className="text-sm font-semibold text-foreground">Annual Legend</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {milestones.yearly.achieved ? (
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white font-bold shadow-md">
                    ✓
                  </div>
                ) : (
                  '365 days to unlock'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}