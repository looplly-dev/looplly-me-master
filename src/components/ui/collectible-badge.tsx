import { cn } from '@/lib/utils';
import { 
  Shield, 
  MapPin, 
  CheckCircle, 
  Star, 
  Users, 
  Flame, 
  Trophy, 
  Award, 
  Crown, 
  Target, 
  Zap,
  Hexagon,
  Diamond,
  Medal,
  Sparkles
} from 'lucide-react';

const iconMap = {
  Shield,
  MapPin,
  CheckCircle,
  Star,
  Users,
  Flame,
  Trophy,
  Award,
  Crown,
  Target,
  Zap,
  Hexagon,
  Diamond,
  Medal,
  Sparkles
};

interface CollectibleBadgeProps {
  badge: {
    id: string;
    name: string;
    description: string;
    tier: string;
    repPoints: number;
    earned: boolean;
    rarity: string;
    icon: string;
    requirement?: number;
    shape?: 'circle' | 'hexagon' | 'shield' | 'star' | 'diamond';
    category?: string;
    requirements?: string[];
    points?: number;
    progress?: number;
    target?: number;
    earnedAt?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function CollectibleBadge({ badge, size = 'md', onClick }: CollectibleBadgeProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Shield;
  
  // Consistent sizing for all badges - mobile optimized
  const sizeClasses = {
    sm: 'w-14 h-14', // Smaller, more consistent mobile size
    md: 'w-16 h-16', // Standard size for mobile
    lg: 'w-20 h-20'  // Larger size
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  // Force all badges to be perfect circles - Pokéball style
  const getShapeClasses = (shape: string) => {
    return 'rounded-full'; // All badges are circles for consistent Pokéball style
  };

  // Electric gradient badges using design system tokens
  const getCategoryStyle = (tier: string, rarity: string) => {
    if (!badge.earned) {
      // Show tier gradient with reduced opacity for unearned badges
      const earnedStyle = getTierGradient(tier);
      return {
        background: earnedStyle.background,
        opacity: 0.4,
        boxShadow: 'none'
      };
    }
    
    return getTierGradient(tier);
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'Diamond':
        return {
          background: 'var(--gradient-diamond)', // Electric cyan to bright blue
          boxShadow: 'var(--shadow-diamond-glow)'
        };
      case 'Platinum':
        return {
          background: 'var(--gradient-platinum)', // Platinum shimmer with purple hints
          boxShadow: 'var(--shadow-platinum-glow)'
        };
      case 'Gold':
        return {
          background: 'var(--gradient-gold)', // Electric gold to bright yellow
          boxShadow: 'var(--shadow-gold-glow)'
        };
      case 'Silver':
        return {
          background: 'var(--gradient-silver)', // Bright silver with shimmer
          boxShadow: 'var(--shadow-silver-glow)'
        };
      case 'Bronze':
        return {
          background: 'var(--gradient-bronze)', // Electric orange to amber
          boxShadow: 'var(--shadow-bronze-glow)'
        };
      default:
        return {
          background: 'var(--gradient-legendary)', // Electric magenta to hot pink
          boxShadow: 'var(--shadow-legendary-glow)'
        };
    }
  };

  // Enhanced rarity effects with psychedelic vibrant rings
  const getRarityEffects = (rarity: string, earned: boolean) => {
    if (!earned) return 'ring-2 ring-muted/30';
    
    switch (rarity) {
      case 'Legendary': 
        return 'ring-4 ring-[hsl(var(--psychedelic-magenta)/0.8)] ring-offset-2 ring-offset-background shadow-2xl animate-pulse';
      case 'Epic': 
        return 'ring-3 ring-[hsl(var(--psychedelic-purple)/0.7)] ring-offset-1 ring-offset-background shadow-xl';
      case 'Rare': 
        return 'ring-2 ring-[hsl(var(--electric-cyan)/0.6)] ring-offset-1 ring-offset-background shadow-lg';
      case 'Common':
        return 'ring-1 ring-[hsl(var(--neon-green)/0.5)] shadow-md';
      default: 
        return '';
    }
  };

  const getLockedState = () => {
    if (badge.earned) return '';
    return 'opacity-50 grayscale hover:opacity-70 transition-opacity duration-200';
  };

  return (
    <div 
      className="relative group touch-manipulation cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cn(
          'relative transition-transform duration-200 hover:scale-105 active:scale-95',
          sizeClasses[size],
          getShapeClasses(badge.shape || 'circle'),
          getRarityEffects(badge.rarity, badge.earned),
          getLockedState(),
          badge.earned && badge.rarity === 'Legendary' && 'animate-pulse'
        )}
        style={getCategoryStyle(badge.tier, badge.rarity)}
      >
        {/* Icon container - no rotation needed for circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent 
            className={cn(
              iconSizes[size],
              'text-white drop-shadow-lg'
            )} 
          />
        </div>

        {/* Simplified earned indicator */}
        {badge.earned && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
            <CheckCircle className="h-2 w-2 text-white" />
          </div>
        )}

        {/* Progress indicator for unearned badges */}
        {!badge.earned && badge.progress !== undefined && badge.target && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}