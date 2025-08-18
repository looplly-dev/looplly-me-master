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

  // Get gradient based on membership tier
  const getGradientId = (tier: string) => {
    if (tier.includes('Silver')) return 'ocean-gradient';
    if (tier.includes('Gold')) return 'celebration-gradient';
    if (tier.includes('Platinum')) return 'cultural-gradient';
    if (tier.includes('Diamond')) return 'multicultural-gradient';
    return 'default-gradient';
  };

  const gradientId = getGradientId(membershipTier);

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
            stroke={`url(#${gradientId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
          
          {/* Multicultural Gradient Definitions */}
          <defs>
            {/* Ocean Gradient - Silver */}
            <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--teal))" />
              <stop offset="100%" stopColor="hsl(var(--teal-glow))" />
            </linearGradient>
            
            {/* Celebration Gradient - Gold */}
            <linearGradient id="celebration-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--achievement))" />
              <stop offset="50%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--magenta))" />
            </linearGradient>
            
            {/* Cultural Gradient - Platinum */}
            <linearGradient id="cultural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--cultural))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
            
            {/* Multicultural Gradient - Diamond */}
            <linearGradient id="multicultural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--teal))" />
              <stop offset="50%" stopColor="hsl(var(--magenta))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            
            {/* Default Gradient */}
            <linearGradient id="default-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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