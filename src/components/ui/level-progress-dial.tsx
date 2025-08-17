import { cn } from '@/lib/utils';

interface LevelProgressDialProps {
  currentLevel: number;
  progress: number; // 0-100 percentage
  pointsToNext?: number;
  membershipTier?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelProgressDial({
  currentLevel,
  progress,
  pointsToNext,
  membershipTier = "Gold Member",
  size = 'md',
  className
}: LevelProgressDialProps) {
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Membership Tier - Minimal */}
      <div className="text-sm font-medium text-muted-foreground tracking-wide">
        {membershipTier}
      </div>

      {/* Progress Dial */}
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Level Number - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-bold text-foreground",
            textSizes[size]
          )}>
            {currentLevel}
          </span>
        </div>
      </div>

      {/* Progress Info - Minimal */}
      {pointsToNext && (
        <div className="text-xs text-muted-foreground font-medium">
          {pointsToNext} to next level
        </div>
      )}
    </div>
  );
}