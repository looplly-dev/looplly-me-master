import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Copy, 
  Share2, 
  UserPlus, 
  CheckCircle, 
  Star,
  TrendingUp,
  Gift
} from 'lucide-react';
import { userStats } from '@/data/mockData';

export default function ReferTab() {
  const [referralLink] = useState('https://looplly.app/ref/USER12345');
  const { toast } = useToast();

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

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Referral Earnings */}
      <Card className="bg-gradient-to-r from-accent to-primary text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Referral Earnings</p>
              <p className="text-4xl font-bold">{userStats.referrals.earnings}</p>
              <p className="text-white/80 text-sm">points earned</p>
            </div>
            <Gift className="h-12 w-12 text-white/60" />
          </div>
          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-white/90">
              Earn 50 points for each qualified referral!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <UserPlus className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{userStats.referrals.invited}</p>
            <p className="text-sm text-muted-foreground">Invited</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{userStats.referrals.joined}</p>
            <p className="text-sm text-muted-foreground">Joined</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{userStats.referrals.qualified}</p>
            <p className="text-sm text-muted-foreground">Qualified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">50%</p>
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
              <h3 className="font-semibold text-sm">You Both Earn</h3>
              <p className="text-xs text-muted-foreground">
                Get 50 points when they complete their first survey
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
            <p>• Refer people who are genuinely interested in earning</p>
            <p>• Share your positive experience with the app</p>
            <p>• Help them complete their profile for better survey matches</p>
            <p>• Quality referrals lead to better rewards!</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>This Month's Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Sarah M.', referrals: 12, badge: '🥇' },
              { rank: 2, name: 'John D.', referrals: 9, badge: '🥈' },
              { rank: 3, name: 'Emma L.', referrals: 7, badge: '🥉' },
              { rank: 4, name: 'You', referrals: userStats.referrals.qualified, badge: '🔥' },
            ].map((user) => (
              <div key={user.rank} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{user.badge}</span>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">#{user.rank}</p>
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