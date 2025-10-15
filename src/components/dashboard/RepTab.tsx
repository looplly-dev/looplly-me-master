import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Shield, 
  MapPin, 
  Flame, 
  Users, 
  Star,
  Target,
  TrendingUp,
  Award,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Maximize2,
  Minimize2,
  Zap
} from 'lucide-react';
import { userStats } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { CollectibleBadge } from '@/components/ui/collectible-badge';
import { BadgeDetailModal } from '@/components/ui/badge-detail-modal';
import { StreakProgress } from '@/components/ui/streak-progress';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useBadgeService } from '@/hooks/useBadgeService';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function RepTab() {
  const { authState } = useAuth();
  const [isCompactView, setIsCompactView] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { listBadges, getUserBadges } = useBadgeService();

  useEffect(() => {
    if (selectedBadge) {
      console.info('Modal will render badge', { id: selectedBadge.id, name: selectedBadge.name });
    }
  }, [selectedBadge]);

  // Fetch admin's badge preview setting
  const { data: profile } = useQuery({
    queryKey: ['user-profile', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('badge_preview_mode')
        .eq('user_id', authState.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.id,
  });

  // Fetch all badges from database
  const { data: allBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => listBadges(true),
  });

  // Fetch user's earned badges
  const { data: userBadges = [], isLoading: userBadgesLoading } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => getUserBadges(),
  });
  // Endless reputation system with tiers and prestige
  const getLevel = (score: number) => {
    if (score >= 2000) return { name: 'Elite', tier: 'Elite', color: 'text-gradient', icon: '👑', min: 2000, max: Infinity };
    if (score >= 1000) return { name: 'Diamond', tier: 'Diamond', color: 'text-cyan-600', icon: '💎', min: 1000, max: 1999 };
    if (score >= 500) return { name: 'Platinum', tier: 'Platinum', color: 'text-purple-600', icon: '⭐', min: 500, max: 999 };
    if (score >= 250) return { name: 'Gold', tier: 'Gold', color: 'text-yellow-600', icon: '🥇', min: 250, max: 499 };
    if (score >= 100) return { name: 'Silver', tier: 'Silver', color: 'text-gray-500', icon: '🥈', min: 100, max: 249 };
    return { name: 'Bronze', tier: 'Bronze', color: 'text-amber-600', icon: '🥉', min: 0, max: 99 };
  };

  const level = getLevel(userStats.reputation.score);
  
  // Calculate prestige level within tier
  const prestigeLevel = Math.floor((userStats.reputation.score - level.min) / Math.max(1, Math.floor((level.max - level.min + 1) / 3))) + 1;
  const prestigeName = prestigeLevel > 3 ? 'III' : prestigeLevel === 3 ? 'III' : prestigeLevel === 2 ? 'II' : 'I';
  
  const nextLevelThreshold = level.max === Infinity ? userStats.reputation.score + 1000 : level.max + 1;
  const progressToNext = level.max === Infinity 
    ? 100 
    : ((userStats.reputation.score - level.min) / (level.max - level.min + 1)) * 100;

  // Map database badges to categories with earned status
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  
  const categoryMap: Record<string, { name: string; icon: any; dbKey: string }> = {
    identity_security: { name: 'Identity & Security', icon: Shield, dbKey: 'identity_security' },
    consistency: { name: 'Consistency Mastery', icon: Flame, dbKey: 'consistency' },
    excellence: { name: 'Excellence & Impact', icon: Award, dbKey: 'excellence' },
    social: { name: 'Social Network', icon: Users, dbKey: 'social' },
    speed: { name: 'Speed Masters', icon: Zap, dbKey: 'speed' },
    perfection: { name: 'Perfection Elite', icon: Target, dbKey: 'perfection' },
    exploration: { name: 'Exploration Heroes', icon: MapPin, dbKey: 'exploration' },
  };

  const badgeCategories = Object.entries(categoryMap).map(([key, value]) => ({
    name: value.name,
    icon: value.icon,
    badges: allBadges
      .filter(badge => badge.category === key)
      .map(badge => {
        const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
        const isEarned = earnedBadgeIds.has(badge.id);
        // Apply badge preview mode: if enabled, show all badges as earned
        const displayAsEarned = profile?.badge_preview_mode || isEarned;
        
        return {
          id: badge.id,
          name: badge.name,
          description: badge.description || '',
          tier: badge.tier ? badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1) : 'Bronze',
          repPoints: badge.rep_points || 0,
          points: badge.rep_points || 0,
          earned: displayAsEarned,
          rarity: badge.rarity || 'Common',
          icon: badge.icon_name || 'Star',
          shape: (badge.shape as 'circle' | 'hexagon' | 'shield' | 'star' | 'diamond') || 'circle',
          category: badge.category || '',
          categoryLabel: categoryMap[badge.category as keyof typeof categoryMap]?.name || badge.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other',
          requirements: badge.requirement ? [badge.requirement] : undefined,
          earnedAt: userBadge?.awarded_at,
          imageUrl: badge.icon_url || undefined,
        };
      }),
  })).filter(cat => cat.badges.length > 0);

  const handleBadgeClick = (badge: any) => {
    console.info('Badge clicked', { 
      id: badge?.id, 
      earned: !!badge?.earned, 
      preview: !!profile?.badge_preview_mode, 
      categoryKey: badge?.category,
      categoryLabel: badge?.categoryLabel 
    });
    setSelectedBadge({ 
      ...badge, 
      earned: (!!profile?.badge_preview_mode) || !!badge.earned 
    });
    setIsModalOpen(true);
  };

  const tips = [
    { 
      title: 'Complete KYC Verification', 
      points: '+30 rep', 
      description: 'Verify identity with Soulbase to unlock withdrawals',
      priority: 'high',
      action: 'Start KYC'
    },
    { 
      title: 'Improve Survey Quality', 
      points: '+20 rep', 
      description: 'Read questions carefully, give consistent responses',
      priority: 'high',
      action: 'View Guide'
    },
    { 
      title: 'Connect Soulbase Crypto Token', 
      points: '+50 rep', 
      description: 'Premium verification for exclusive opportunities',
      priority: 'medium',
      action: 'Connect Token'
    },
    { 
      title: 'Slow Down Survey Completion', 
      points: '+15 rep', 
      description: 'Take time to read - avoid speeding penalties',
      priority: 'medium',
      action: 'Learn More'
    },
    { 
      title: 'Enable WhatsApp Notifications', 
      points: '+5 rep', 
      description: 'Get quick surveys via WhatsApp',
      priority: 'low',
      action: 'Enable'
    }
  ];

  // Show loading state
  if (badgesLoading || userBadgesLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-20 lg:pb-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:p-6 lg:p-8 pb-24 md:pb-20 lg:pb-8 space-y-4 md:space-y-6">
      {/* View Toggle Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Reputation</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCompactView(!isCompactView)}
          className="flex items-center gap-2"
        >
          {isCompactView ? (
            <>
              <Maximize2 className="h-4 w-4" />
              Detailed View
            </>
          ) : (
            <>
              <Minimize2 className="h-4 w-4" />
              Compact View
            </>
          )}
        </Button>
      </div>
      {/* Enhanced Reputation Score - Always Visible */}
      <Card className="bg-card shadow-sm border border-primary/20">
        <CardContent className={isCompactView ? "p-4" : "p-6"}>
          <div className="text-center">
            <div className={isCompactView ? "text-4xl mb-1" : "text-6xl mb-2"}>{level.icon}</div>
            <h2 className={isCompactView ? "text-xl font-bold mb-1" : "text-2xl font-bold mb-1"}>
              {level.name} {prestigeName}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {userStats.reputation.score} Rep • {level.tier} Tier
            </p>
            
            {!isCompactView && (
              <>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray={`${Math.min(progressToNext, 100)}, 100`}
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{userStats.reputation.score}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  {level.max === Infinity 
                    ? 'Elite Level - Endless Progression!' 
                    : `${nextLevelThreshold - userStats.reputation.score} points to next tier`
                  }
                </p>
              </>
            )}
            
            {isCompactView && (
              <div className="flex justify-center items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{userStats.reputation.score}</p>
                  <p className="text-xs text-muted-foreground">Current</p>
                </div>
                <Progress value={progressToNext} className="w-20 h-2" />
                <div className="text-center">
                  <p className="text-lg font-semibold">{level.max === Infinity ? '∞' : nextLevelThreshold}</p>
                  <p className="text-xs text-muted-foreground">Next</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tier Progression */}
      <CollapsibleSection
        title="Tier Progression" 
        icon={<TrendingUp className="h-5 w-5" />}
        defaultOpen={!isCompactView}
        compactContent={
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <Badge variant="default" className="text-sm">{level.name} {prestigeName}</Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm">{Math.round(progressToNext)}% to next</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-3 rounded-xl transition-all ${userStats.reputation.score >= 0 ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200' : 'bg-gray-50 text-muted-foreground border'}`}>
              <div className="text-lg mb-1">🥉</div>
              <div className="text-xs font-medium">Bronze</div>
              <div className="text-xs opacity-75">0-99</div>
            </div>
            <div className={`p-3 rounded-xl transition-all ${userStats.reputation.score >= 100 ? 'bg-gray-50 text-gray-700 shadow-sm border border-gray-200' : 'bg-gray-50 text-muted-foreground border'}`}>
              <div className="text-lg mb-1">🥈</div>
              <div className="text-xs font-medium">Silver</div>
              <div className="text-xs opacity-75">100-249</div>
            </div>
            <div className={`p-3 rounded-xl transition-all ${userStats.reputation.score >= 250 ? 'bg-yellow-50 text-yellow-800 shadow-sm border border-yellow-200' : 'bg-gray-50 text-muted-foreground border'}`}>
              <div className="text-lg mb-1">🥇</div>
              <div className="text-xs font-medium">Gold</div>
              <div className="text-xs opacity-75">250-499</div>
            </div>
            <div className={`p-3 rounded-xl transition-all ${userStats.reputation.score >= 500 ? 'bg-purple-50 text-purple-800 shadow-sm border border-purple-200' : 'bg-gray-50 text-muted-foreground border'}`}>
              <div className="text-lg mb-1">⭐</div>
              <div className="text-xs font-medium">Platinum</div>
              <div className="text-xs opacity-75">500-999</div>
            </div>
            <div className={`p-3 rounded-xl transition-all ${userStats.reputation.score >= 1000 ? 'bg-cyan-50 text-cyan-800 shadow-sm border border-cyan-200' : 'bg-gray-50 text-muted-foreground border'}`}>
              <div className="text-lg mb-1">💎</div>
              <div className="text-xs font-medium">Diamond</div>
              <div className="text-xs opacity-75">1000-1999</div>
            </div>
            <div className={`p-3 rounded-xl transition-all ${userStats.reputation.score >= 2000 ? 'bg-orange-50 text-orange-800 shadow-sm border border-orange-200' : 'bg-gray-50 text-muted-foreground border'}`}>
              <div className="text-lg mb-1">👑</div>
              <div className="text-xs font-medium">Elite</div>
              <div className="text-xs opacity-75">2000+</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to {level.max === Infinity ? 'Next Milestone' : 'Next Tier'}</span>
              <span className="font-medium">{Math.round(progressToNext)}%</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {level.max === Infinity 
                ? 'You\'ve reached Elite status! Keep earning for prestige levels.' 
                : `${nextLevelThreshold - userStats.reputation.score} Rep to unlock ${
                    userStats.reputation.score >= 1000 ? 'Elite' :
                    userStats.reputation.score >= 500 ? 'Diamond' : 
                    userStats.reputation.score >= 250 ? 'Platinum' :
                    userStats.reputation.score >= 100 ? 'Gold' : 'Silver'
                  } tier`
              }
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Daily Streak Progress */}
      <CollapsibleSection
        title="Daily Streak Progress"
        icon={<Flame className="h-5 w-5" />}
        defaultOpen={!isCompactView}
        compactContent={
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{userStats.streaks.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-accent">{userStats.streaks.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Best</p>
            </div>
          </div>
        }
      >
        <StreakProgress 
          currentStreak={userStats.streaks.currentStreak}
          longestStreak={userStats.streaks.longestStreak}
          daysUntilMonthlyMilestone={userStats.streaks.daysUntilMonthlyMilestone}
          monthsUntilYearly={userStats.streaks.monthsUntilYearly}
          milestones={userStats.streaks.milestones}
        />
      </CollapsibleSection>

      {/* Collectible Badges & Achievements */}
      <CollapsibleSection
        title="Badge Collection"
        icon={<Star className="h-5 w-5" />}
        defaultOpen={!isCompactView}
        priority="high"
        compactContent={
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {badgeCategories.slice(0, 2).map((category) => 
              category.badges.filter(b => b.earned).slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex-shrink-0">
                  <CollectibleBadge 
                    badge={badge} 
                    size="sm"
                    onClick={() => handleBadgeClick(badge)}
                  />
                </div>
              ))
            ).flat()}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">
                +{badgeCategories.reduce((total, cat) => total + cat.badges.filter(b => b.earned).length, 0) - 6}
              </span>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          {badgeCategories.map((category) => (
            <div key={category.name} className="space-y-4">
              {/* Category Header with Progress */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  {category.name}
                </h3>
                <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                  {category.badges.filter(b => b.earned).length}/{category.badges.length}
                </Badge>
              </div>

              {/* Badge Carousel */}
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                  dragFree: false,
                  containScroll: "trimSnaps",
                  skipSnaps: false,
                  duration: 25,
                }}
                className="w-full"
              >
                <CarouselContent className="ml-0 gap-10 py-12">
                  {category.badges.map((badge, index) => (
                    <CarouselItem key={badge.id} index={index} className="basis-auto pl-0">
                      <CollectibleBadge 
                        badge={badge} 
                        size="md"
                        onClick={() => handleBadgeClick(badge)}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Progress Bar for Category */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(category.badges.filter(b => b.earned).length / category.badges.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}

        </div>
      </CollapsibleSection>

      {/* Survey Quality Metrics */}
      <CollapsibleSection
        title="Data Quality Score"
        icon={<CheckCircle className="h-5 w-5" />}
        defaultOpen={!isCompactView}
        priority="medium"
        compactContent={
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-success">{userStats.reputation.qualityMetrics.consistencyScore}%</p>
              <p className="text-xs text-muted-foreground">Quality</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">
                {Math.round((userStats.reputation.qualityMetrics.surveysCompleted / (userStats.reputation.qualityMetrics.surveysCompleted + userStats.reputation.qualityMetrics.surveysRejected)) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
              <p className="text-2xl font-bold text-green-700">{userStats.reputation.qualityMetrics.consistencyScore}%</p>
              <p className="text-sm text-muted-foreground">Consistency</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-2xl font-bold text-blue-700">{userStats.reputation.qualityMetrics.averageTime}</p>
              <p className="text-sm text-muted-foreground">Avg. Time</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white border border-green-200 rounded-lg shadow-sm">
              <span className="text-sm font-medium">Surveys Completed</span>
              <Badge variant="default" className="bg-green-50 text-green-700 border border-green-200">
                {userStats.reputation.qualityMetrics.surveysCompleted}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-white border border-red-200 rounded-lg shadow-sm">
              <span className="text-sm font-medium">Surveys Rejected</span>
              <Badge variant="destructive" className="bg-red-50 border border-red-200">
                {userStats.reputation.qualityMetrics.surveysRejected}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-white border border-blue-200 rounded-lg shadow-sm">
              <span className="text-sm font-medium">Success Rate</span>
              <Badge variant="default" className="bg-blue-50 text-blue-700 border border-blue-200">
                {Math.round((userStats.reputation.qualityMetrics.surveysCompleted / (userStats.reputation.qualityMetrics.surveysCompleted + userStats.reputation.qualityMetrics.surveysRejected)) * 100)}%
              </Badge>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Reputation History */}
      <CollapsibleSection
        title="Reputation History"
        icon={<Clock className="h-5 w-5" />}
        defaultOpen={false}
        compactContent={
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {userStats.reputation.history.length} recent activities
            </p>
          </div>
        }
      >
        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-gutter">
          {userStats.reputation.history.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md">
              <div className={`p-2 rounded-full ${
                entry.points > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {entry.points > 0 ? (
                  <Plus className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{entry.action}</p>
                <p className="text-xs text-muted-foreground">{entry.date}</p>
              </div>
              <Badge variant={entry.points > 0 ? "default" : "destructive"} className="text-sm">
                {entry.points > 0 ? '+' : ''}{entry.points}
              </Badge>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Reputation Benefits */}
      <CollapsibleSection
        title="Reputation Benefits"
        icon={<Trophy className="h-5 w-5" />}
        defaultOpen={false}
        compactContent={
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              5 exclusive benefits unlocked
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 shadow-sm">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm font-medium">Higher-paying survey opportunities</span>
            <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium">Priority access to new features</span>
            <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 shadow-sm">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-sm font-medium">Exclusive Gold+ member surveys</span>
            <CheckCircle className="h-4 w-4 text-purple-600 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 shadow-sm">
            <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
            <span className="text-sm font-medium">Faster payment processing</span>
            <CheckCircle className="h-4 w-4 text-amber-600 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span className="text-sm font-medium">Premium crypto verification access</span>
            <CheckCircle className="h-4 w-4 text-orange-600 ml-auto" />
          </div>
        </div>
      </CollapsibleSection>

      {/* Improvement Action Plan */}
      <CollapsibleSection
        title="Action Plan to Improve"
        icon={<Target className="h-5 w-5" />}
        defaultOpen={!isCompactView}
        priority="high"
        compactContent={
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {tips.filter(t => t.priority === 'high').length} high priority actions
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className={`p-4 rounded-xl border transition-all hover:shadow-md bg-white shadow-sm ${
              tip.priority === 'high' ? 'border-red-200' :
              tip.priority === 'medium' ? 'border-amber-200' :
              'border-blue-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {tip.priority === 'high' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {tip.priority === 'medium' && <Clock className="h-4 w-4 text-warning" />}
                    {tip.priority === 'low' && <CheckCircle className="h-4 w-4 text-info" />}
                    <h4 className="font-semibold text-sm">{tip.title}</h4>
                    <Badge variant="outline" className="text-xs font-medium">
                      {tip.points}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
                <Button size="sm" variant="default" className="shrink-0">
                  {tip.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Reputation Tips:</strong> Higher reputation unlocks better opportunities, faster payments, and premium features. Complete actions above to boost your score efficiently.
          </p>
        </div>
      </CollapsibleSection>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        key={selectedBadge?.id || 'no-badge'}
        badge={selectedBadge}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedBadge(null);
        }}
        previewEarned={!!profile?.badge_preview_mode}
      />
    </div>
  );
}