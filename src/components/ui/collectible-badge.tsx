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
  
  // Responsive sizing for all badges
  const sizeClasses = {
    sm: 'w-14 h-14 md:w-16 md:h-16', // Responsive small
    md: 'w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20', // Responsive medium
    lg: 'w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28'  // Responsive large
  };

  const iconSizes = {
    sm: 'h-5 w-5 md:h-6 md:w-6',
    md: 'h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8',
    lg: 'h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12'
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
    // Use badge ID to deterministically choose one of 3 colors per tier
    const colorIndex = badge.id.length % 3;
    
    switch (tier) {
      case 'Diamond':
        const diamondGradients = [
          'var(--diamond-african-star)',
          'var(--diamond-kohinoor)', 
          'var(--diamond-namib-crystal)'
        ];
        return {
          background: diamondGradients[colorIndex],
          boxShadow: 'var(--shadow-diamond-glow)'
        };
      case 'Platinum':
        const platinumGradients = [
          'var(--platinum-victoria-falls)',
          'var(--platinum-taj-mahal)',
          'var(--platinum-kilimanjaro-peak)'
        ];
        return {
          background: platinumGradients[colorIndex],
          boxShadow: 'var(--shadow-platinum-glow)'
        };
      case 'Gold':
        const goldGradients = [
          'var(--gold-sahara-crown)',
          'var(--gold-lions-mane)',
          'var(--gold-rajasthani-gold)'
        ];
        return {
          background: goldGradients[colorIndex],
          boxShadow: 'var(--shadow-gold-glow)'
        };
      case 'Silver':
        const silverGradients = [
          'var(--silver-serengeti-storm)',
          'var(--silver-zambezi-mist)',
          'var(--silver-monsoon-silver)'
        ];
        return {
          background: silverGradients[colorIndex],
          boxShadow: 'var(--shadow-silver-glow)'
        };
      case 'Bronze':
        const bronzeGradients = [
          'var(--bronze-savanna-sunset)',
          'var(--bronze-turmeric-fire)',
          'var(--bronze-cinnamon-spice)'
        ];
        return {
          background: bronzeGradients[colorIndex],
          boxShadow: 'var(--shadow-bronze-glow)'
        };
      default:
        return {
          background: 'var(--gradient-legendary)',
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