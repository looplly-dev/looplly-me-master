import { useState } from 'react';
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
  Minimize2
} from 'lucide-react';
import { userStats, badgeSystem } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { CollectibleBadge } from '@/components/ui/collectible-badge';
import { StreakProgress } from '@/components/ui/streak-progress';
import { CollapsibleSection } from '@/components/ui/collapsible-section';

export default function RepTab() {
  const { authState } = useAuth();
  const [isCompactView, setIsCompactView] = useState(false);
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

  // Combine all badge categories into one array
  const allBadges = [
    ...badgeSystem.coreVerification,
    ...badgeSystem.streakAchievements,
    ...badgeSystem.qualityAchievements
  ];

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

  return (
    <div className="p-4 pb-20 space-y-4">
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
      <Card className="bg-white shadow-sm border border-primary/20">
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
          <div className="flex justify-center gap-2">
            {allBadges.filter(b => b.earned).slice(0, 6).map((badge) => (
              <div key={badge.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-xs">{badge.icon}</span>
              </div>
            ))}
            {allBadges.filter(b => b.earned).length > 6 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">+{allBadges.filter(b => b.earned).length - 6}</span>
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Core Verification Badges */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Core Verification
              <Badge variant="outline" className="text-xs">
                {badgeSystem.coreVerification.filter(b => b.earned).length}/{badgeSystem.coreVerification.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {badgeSystem.coreVerification.map((badge) => (
                <CollectibleBadge 
                  key={badge.id} 
                  badge={badge} 
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Streak Achievement Badges */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Streak Achievements
              <Badge variant="outline" className="text-xs">
                {badgeSystem.streakAchievements.filter(b => b.earned).length}/{badgeSystem.streakAchievements.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {badgeSystem.streakAchievements.map((badge) => (
                <CollectibleBadge 
                  key={badge.id} 
                  badge={badge} 
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Quality Achievement Badges */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Quality Achievements
              <Badge variant="outline" className="text-xs">
                {badgeSystem.qualityAchievements.filter(b => b.earned).length}/{badgeSystem.qualityAchievements.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {badgeSystem.qualityAchievements.map((badge) => (
                <CollectibleBadge 
                  key={badge.id} 
                  badge={badge} 
                  size="sm"
                />
              ))}
            </div>
          </div>
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
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Surveys Completed</span>
              <Badge variant="default" className="bg-success/20 text-success">
                {userStats.reputation.qualityMetrics.surveysCompleted}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Surveys Rejected</span>
              <Badge variant="destructive" className="bg-destructive/20">
                {userStats.reputation.qualityMetrics.surveysRejected}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Success Rate</span>
              <Badge variant="default" className="bg-primary/20 text-primary">
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
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {userStats.reputation.history.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg transition-all hover:bg-secondary/50">
              <div className={`p-2 rounded-full ${
                entry.points > 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
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
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-success/10 to-success/20 rounded-lg border border-success/20">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm font-medium">Higher-paying survey opportunities</span>
            <CheckCircle className="h-4 w-4 text-success ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-primary/20">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm font-medium">Priority access to new features</span>
            <CheckCircle className="h-4 w-4 text-primary ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-accent/10 to-accent/20 rounded-lg border border-accent/20">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-sm font-medium">Exclusive Gold+ member surveys</span>
            <CheckCircle className="h-4 w-4 text-accent ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-warning/10 to-warning/20 rounded-lg border border-warning/20">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-sm font-medium">Faster payment processing</span>
            <CheckCircle className="h-4 w-4 text-warning ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-crypto/10 to-crypto/20 rounded-lg border border-crypto/20">
            <div className="w-3 h-3 bg-crypto rounded-full"></div>
            <span className="text-sm font-medium">Premium crypto verification access</span>
            <CheckCircle className="h-4 w-4 text-crypto ml-auto" />
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
            <div key={index} className={`p-4 rounded-xl border transition-all hover:shadow-md ${
              tip.priority === 'high' ? 'border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10' :
              tip.priority === 'medium' ? 'border-warning/30 bg-gradient-to-r from-warning/5 to-warning/10' :
              'border-info/30 bg-gradient-to-r from-info/5 to-info/10'
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
        
        <div className="mt-4 p-3 bg-info/5 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Reputation Tips:</strong> Higher reputation unlocks better opportunities, faster payments, and premium features. Complete actions above to boost your score efficiently.
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}