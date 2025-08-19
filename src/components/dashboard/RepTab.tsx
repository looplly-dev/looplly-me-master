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
  AlertTriangle
} from 'lucide-react';
import { userStats, badgeSystem } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { CollectibleBadge } from '@/components/ui/collectible-badge';
import { StreakProgress } from '@/components/ui/streak-progress';

export default function RepTab() {
  const { authState } = useAuth();
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
    <div className="p-4 pb-20 space-y-6">
      {/* Reputation Score */}
      <Card className="border-border/50 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-6xl mb-2">{level.icon}</div>
            <h2 className="text-2xl font-bold mb-1 text-foreground">{level.name} Member</h2>
            <p className="text-muted-foreground text-sm mb-4">Reputation Score</p>
            
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
                  strokeDasharray={`${userStats.reputation.score}, 100`}
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
              {100 - userStats.reputation.score} points to {userStats.reputation.score >= 80 ? 'max level' : 'next level'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className={`p-2 rounded-lg ${userStats.reputation.score >= 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>
              <div className="text-lg">🥉</div>
              <div className="text-xs font-medium">Bronze</div>
              <div className="text-xs">0-24</div>
            </div>
            <div className={`p-2 rounded-lg ${userStats.reputation.score >= 25 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
              <div className="text-lg">🥈</div>
              <div className="text-xs font-medium">Silver</div>
              <div className="text-xs">25-49</div>
            </div>
            <div className={`p-2 rounded-lg ${userStats.reputation.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 text-gray-400'}`}>
              <div className="text-lg">🥇</div>
              <div className="text-xs font-medium">Gold</div>
              <div className="text-xs">50-79</div>
            </div>
            <div className={`p-2 rounded-lg ${userStats.reputation.score >= 80 ? 'bg-purple-100 text-purple-800' : 'bg-gray-50 text-gray-400'}`}>
              <div className="text-lg">💎</div>
              <div className="text-xs font-medium">Platinum</div>
              <div className="text-xs">80-100</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {userStats.reputation.score >= 80 ? 'Max Level' : 'Next Level'}</span>
              <span>{userStats.reputation.score}%</span>
            </div>
            <Progress value={userStats.reputation.score} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {allBadges.map((badge) => (
              <CollectibleBadge 
                key={badge.id} 
                badge={badge} 
                size="md" 
                showDetails={false}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Survey Quality Metrics */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Data Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-xl font-bold text-success">{userStats.reputation.qualityMetrics.consistencyScore}%</p>
              <p className="text-xs text-muted-foreground">Consistency</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-xl font-bold text-primary">{userStats.reputation.qualityMetrics.averageTime}</p>
              <p className="text-xs text-muted-foreground">Avg. Time</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Surveys Completed</span>
              <span className="text-success">{userStats.reputation.qualityMetrics.surveysCompleted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Surveys Rejected</span>
              <span className="text-destructive">{userStats.reputation.qualityMetrics.surveysRejected}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span className="text-primary">
                {Math.round((userStats.reputation.qualityMetrics.surveysCompleted / (userStats.reputation.qualityMetrics.surveysCompleted + userStats.reputation.qualityMetrics.surveysRejected)) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reputation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userStats.reputation.history.map((entry, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className={`p-1.5 rounded-full ${
                  entry.points > 0 ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {entry.points > 0 ? (
                    <Plus className="h-3 w-3 text-success" />
                  ) : (
                    <Minus className="h-3 w-3 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
                <div className={`text-sm font-semibold ${
                  entry.points > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {entry.points > 0 ? '+' : ''}{entry.points}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reputation Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Reputation Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm">Higher-paying survey opportunities</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Priority access to new features</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span className="text-sm">Exclusive Gold+ member surveys</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-sm">Faster payment processing</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-crypto/5 rounded-lg">
            <div className="w-2 h-2 bg-crypto rounded-full"></div>
            <span className="text-sm">Premium crypto verification access</span>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Action Plan */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            Action Plan to Improve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                tip.priority === 'high' ? 'border-destructive bg-destructive/5' :
                tip.priority === 'medium' ? 'border-warning bg-warning/5' :
                'border-info bg-info/5'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {tip.priority === 'high' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      <h4 className="font-semibold text-sm">{tip.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {tip.points}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs shrink-0">
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
        </CardContent>
      </Card>

      {/* Survey Quality Guide */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Avoid Survey Rejections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-destructive bg-background/50 rounded-r-lg">
              <h4 className="font-semibold text-sm text-destructive mb-1">Inconsistent Responses (-15 rep)</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Example: Saying "Coca-Cola is my favorite brand" then later saying "I never drink Coca-Cola"
              </p>
              <p className="text-xs text-success">✓ Read questions carefully and stay consistent throughout</p>
            </div>
            
            <div className="p-3 border-l-4 border-warning bg-background/50 rounded-r-lg">
              <h4 className="font-semibold text-sm text-warning mb-1">Speeding Through (-10 rep)</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Completing surveys too quickly (under minimum expected time)
              </p>
              <p className="text-xs text-success">✓ Take time to read each question thoroughly</p>
            </div>
            
            <div className="p-3 border-l-4 border-destructive bg-background/50 rounded-r-lg">
              <h4 className="font-semibold text-sm text-destructive mb-1">False Demographics (-20 rep)</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Lying about age, income, location, or other profile details
              </p>
              <p className="text-xs text-success">✓ Always provide truthful personal information</p>
            </div>
            
            <div className="p-3 border-l-4 border-info bg-background/50 rounded-r-lg">
              <h4 className="font-semibold text-sm text-info mb-1">Quality Bonus (+25 rep)</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Thoughtful, detailed responses that pass all quality checks
              </p>
              <p className="text-xs text-success">✓ Provide detailed answers when asked for explanations</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-success/5 rounded-lg">
            <p className="text-xs text-muted-foreground">
              🎯 <strong>Remember:</strong> We pay for quality data. High reputation members earn more through premium surveys and faster payments. Take your time and be honest!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-xl font-bold text-primary">{userStats.surveysCompleted}</p>
              <p className="text-xs text-muted-foreground">Surveys Done</p>
            </div>
            <div className="text-center p-3 bg-accent/5 rounded-lg">
              <p className="text-xl font-bold text-accent">{userStats.streaks.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center p-3 bg-success/5 rounded-lg">
              <p className="text-xl font-bold text-success">{userStats.referrals.qualified}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
            <div className="text-center p-3 bg-warning/5 rounded-lg">
              <p className="text-xl font-bold text-warning">{userStats.totalEarnings}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}