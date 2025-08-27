import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useReferrals } from '@/hooks/useReferrals';
import { useReferralCodes } from '@/hooks/useReferralCodes';
import { 
  Users, 
  Copy, 
  Share2, 
  UserPlus, 
  CheckCircle, 
  Star,
  TrendingUp,
  Gift,
  Shield,
  DollarSign,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function ReferTab() {
  const { toast } = useToast();
  const { referrals, stats, isLoading: referralsLoading } = useReferrals();
  const { primaryCode, getReferralLink, generateReferralCode, isLoading: codesLoading } = useReferralCodes();
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (primaryCode) {
      setReferralLink(getReferralLink(primaryCode.code));
    }
  }, [primaryCode, getReferralLink]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Looplly and Start Earning!',
        text: 'Earn money by completing surveys and watching videos. Use my referral link to get started!',
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  const handleGenerateNewCode = async () => {
    const newCode = await generateReferralCode();
    if (newCode) {
      toast({
        title: 'New Code Generated!',
        description: 'Your new referral code is ready to use.',
      });
    }
  };

  if (referralsLoading || codesLoading) {
    return (
      <div className="p-4 pb-20 space-y-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Referral Earnings */}
      <Card className="bg-card border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-primary text-sm font-medium">AI Secured</span>
              </div>
              <div className="mb-1">
                <p className="text-muted-foreground text-sm">Referral Earnings</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <DollarSign className="h-6 w-6 text-success" />
                <p className="text-4xl font-bold text-foreground">
                  {stats?.total_earnings.toFixed(2) || '0.00'}
                </p>
              </div>
              <p className="text-muted-foreground text-xs">total earned</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Earn $0.35 per qualified referral</span>
              {stats && stats.pending_payouts > 0 && (
                <Badge variant="outline" className="text-warning">
                  {stats.pending_payouts} pending
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <UserPlus className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats?.total_invited || 0}</p>
            <p className="text-sm text-muted-foreground">Invited</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{stats?.total_joined || 0}</p>
            <p className="text-sm text-muted-foreground">Joined</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{stats?.total_qualified || 0}</p>
            <p className="text-sm text-muted-foreground">Qualified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{stats?.success_rate.toFixed(0) || 0}%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <Input
              value={referralLink}
              readOnly
              className="bg-transparent border-0 text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={handleShare}
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          {primaryCode && (
            <div className="pt-2 border-t border-border/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Code: {primaryCode.code} • Uses: {primaryCode.uses_count}/{primaryCode.max_uses}
                </span>
                <Button
                  onClick={handleGenerateNewCode}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Share Your Link</h3>
              <p className="text-xs text-muted-foreground">
                Send your referral link to friends and family
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-sm">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">They Sign Up</h3>
              <p className="text-xs text-muted-foreground">
                Your friend creates an account using your link
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-success font-bold text-sm">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">They Earn $0.35+</h3>
              <p className="text-xs text-muted-foreground">
                Your friend must earn at least $0.35 to qualify your referral
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-warning font-bold text-sm">4</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Verification</h3>
              <p className="text-xs text-muted-foreground">
                Our AI accountant verifies earnings and processes your $0.35 payout
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Quality Tips */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Star className="h-5 w-5" />
            Quality Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Refer people who are genuinely interested in earning money</p>
            <p>• Help them reach the minimum 100 reputation points</p>
            <p>• Guide them to earn their first $0.35 for qualification</p>
            <p>• Quality referrals = faster AI verification and payouts</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Referrals */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Your Active Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      referral.accountant_status === 'payout_completed' ? 'bg-success' :
                      referral.accountant_status === 'funds_verified' ? 'bg-warning' :
                      referral.qualification_met ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <p className="font-semibold text-sm">Referral #{referral.id.slice(-6)}</p>
                      <p className="text-xs text-muted-foreground">
                        {referral.accountant_status === 'payout_completed' ? 'Completed' :
                         referral.accountant_status === 'funds_verified' ? 'Payout Approved' :
                         referral.accountant_status === 'verifying_funds' ? 'AI Verifying' :
                         referral.qualification_met ? 'Qualified' : 
                         `$${referral.referee_earnings.toFixed(2)} / $0.35`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {referral.payout_completed ? (
                      <Badge className="text-success border-success">
                        $0.35 Paid
                      </Badge>
                    ) : referral.qualification_met ? (
                      <Badge variant="outline" className="text-warning">
                        Processing
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {referrals.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Showing 5 of {referrals.length} referrals
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>This Month's Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Sarah M.', referrals: 12, earnings: '$4.20', badge: '🥇' },
              { rank: 2, name: 'John D.', referrals: 9, earnings: '$3.15', badge: '🥈' },
              { rank: 3, name: 'Emma L.', referrals: 7, earnings: '$2.45', badge: '🥉' },
              { rank: 4, name: 'You', referrals: stats?.total_qualified || 0, earnings: `$${(stats?.total_earnings || 0).toFixed(2)}`, badge: '🔥' },
            ].map((user) => (
              <div key={user.rank} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{user.badge}</span>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">#{user.rank} • {user.earnings}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {user.referrals} qualified
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}