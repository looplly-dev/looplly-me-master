import { cn } from '@/lib/utils';
import { ContextualHelp } from './contextual-help';

interface LevelProgressDialProps {
  currentLevel: number;
  progress: number; // 0-100 percentage
  pointsToNext?: number;
  membershipTier?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxLevel?: number;
  showHelp?: boolean;
}

export function LevelProgressDial({
  currentLevel,
  progress,
  pointsToNext,
  membershipTier = "Premium Member",
  size = 'md',
  className,
  maxLevel = 100,
  showHelp = true
}: LevelProgressDialProps) {
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const progressTextSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={cn("flex flex-col items-center gap-4", className)}
      role="region"
      aria-label="Level Progress"
    >
      {/* Header with Membership Tier and Help */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-wide">
          {membershipTier}
        </h2>
        {showHelp && (
          <ContextualHelp 
            content="Your membership level determines your earning potential and available features. Complete activities to gain points and level up."
            position="bottom"
          />
        )}
      </div>

      {/* Progress Dial Container */}
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-labelledby="progress-title"
          aria-describedby="progress-desc"
        >
          <title id="progress-title">Level Progress Circle</title>
          <desc id="progress-desc">
            Level {currentLevel} of {maxLevel}, {progress}% complete
          </desc>
          
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            opacity="0.3"
          />
          
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))'
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className={cn(
              "font-bold text-foreground leading-none",
              textSizes[size]
            )}
            aria-label={`Current level ${currentLevel}`}
          >
            {currentLevel}
          </span>
          <span className={cn(
            "text-muted-foreground font-medium leading-none mt-1",
            progressTextSizes[size]
          )}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress Information */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-sm font-medium text-foreground">
          Level {currentLevel} of {maxLevel}
        </h3>
        
        {pointsToNext && (
          <p className="text-xs text-muted-foreground">
            {pointsToNext} points to level {currentLevel + 1}
          </p>
        )}
        
        {/* Progress Bar as Alternative Indicator */}
        <div className="w-24 bg-muted rounded-full h-1.5 mt-2">
          <div 
            className="h-1.5 bg-primary rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}% progress to next level`}
          />
        </div>
      </div>
    </div>
  );
}