import React from "react"
import { X, Calendar, Trophy, Target, Clock, Shield, Flame, Users, Star, MapPin, Award, Zap, Crown, CheckCircle, Hexagon, Diamond, Medal, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Icon mapping system (exactly matching CollectibleBadge)
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
}

interface BadgeDetailModalProps {
  badge: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BadgeDetailModal({ badge, open, onOpenChange }: BadgeDetailModalProps) {
  if (!badge) return null

  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'hexagon':
        return 'rounded-3xl'
      case 'shield':
        return 'rounded-t-3xl rounded-b-sm'
      case 'star':
        return 'rounded-2xl rotate-12'
      case 'diamond':
        return 'rounded-2xl rotate-45'
      default:
        return 'rounded-full'
    }
  }

  const getTierGradient = (tier: string) => {
    // Use badge ID to deterministically choose one of available colors per tier
    const colorIndex = badge.id ? badge.id.length % 3 : 0;
    
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
  }

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
  }

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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-background/95 backdrop-blur-sm border-2 p-0 overflow-hidden">
        {/* Header with close button */}
        <div className="relative p-6 pb-4">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-2 bg-background/80 hover:bg-background transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Large Badge Display */}
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Large Badge */}
            <div className="relative">
            <div
              className={cn(
                "w-32 h-32 flex items-center justify-center shadow-lg transition-all duration-300 rounded-full",
                getRarityEffects(badge.rarity, badge.earned),
                badge.earned ? "opacity-100" : "opacity-40 grayscale"
              )}
              style={getCategoryStyle(badge.tier, badge.rarity)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {(() => {
                  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Shield;
                  return <IconComponent className="h-12 w-12 text-white drop-shadow-lg" />;
                })()}
              </div>
              
              {/* Earned indicator */}
              {badge.earned && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center z-20 ring-2 ring-background shadow-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
              </div>
            </div>

            {/* Badge Info */}
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold">{badge.name}</DialogTitle>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {badge.tier}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {badge.category}
                  </Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {badge.description}
              </p>
            </div>

            {/* Progress Section */}
            {badge.progress !== undefined && (
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Progress
                  </span>
                  <span className="font-medium">
                    {badge.progress}/{badge.target || 100}
                  </span>
                </div>
                <Progress value={(badge.progress / (badge.target || 100)) * 100} className="h-2" />
              </div>
            )}

            {/* Achievement Details */}
            <div className="w-full space-y-3 border-t pt-4">
              {badge.earned && badge.earnedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Earned on {new Date(badge.earnedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {badge.requirements && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-3 w-3" />
                    Requirements
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-5">
                    {badge.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="list-disc">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {badge.points && (
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span className="font-medium">{badge.points} Reputation Points</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}