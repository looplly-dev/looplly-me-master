import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  Gift, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';

export default function WalletTab() {
  const { balance, isLoading: balanceLoading } = useBalance();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { authState } = useAuth();

  if (balanceLoading) {
    return (
      <div className="p-4 pb-20 space-y-6">
        <SkeletonLoader variant="balance" />
        <SkeletonLoader variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Balance Overview */}
      <Card className="bg-green-600 text-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Available Balance</p>
              <p className="text-4xl font-bold">${balance?.available_balance?.toFixed(2) || '0.00'}</p>
              <p className="text-white/80 text-sm">USD</p>
            </div>
            <Wallet className="h-12 w-12 text-white/60" />
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-white/20">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Lifetime earnings: ${balance?.total_earned?.toFixed(2) || '0.00'} USD</span>
          </div>
        </CardContent>
      </Card>

      {/* KYC Requirement Banner */}
      {!authState.user?.profileComplete && (
        <Card className="bg-amber-50 border border-amber-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Profile Completion Required</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Complete your profile to unlock withdrawals and access all earning opportunities.
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Complete Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-white shadow-sm border border-blue-200">
          <CardContent className="p-4 text-center">
            <Smartphone className="h-6 w-6 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm mb-1">Airtime</h3>
            <p className="text-xs text-muted-foreground mb-3">Mobile top-up</p>
            <Button size="sm" variant="outline" disabled={!authState.user?.profileComplete} className="w-full text-xs">
              {authState.user?.profileComplete ? 'Min $5.00' : 'Profile Required'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-lg mb-2">📱</div>
            <h3 className="font-semibold text-sm mb-1">M-Pesa</h3>
            <p className="text-xs text-muted-foreground mb-3">Mobile money</p>
            <Button size="sm" variant="outline" disabled={!authState.user?.profileComplete} className="w-full text-xs">
              {authState.user?.profileComplete ? 'Min $2.50' : 'Profile Required'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white shadow-sm border border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-lg mb-2">₿</div>
            <h3 className="font-semibold text-sm mb-1">Crypto</h3>
            <p className="text-xs text-muted-foreground mb-3">Bitcoin/USDT</p>
            <Button size="sm" variant="outline" disabled={!authState.user?.profileComplete} className="w-full text-xs">
              {authState.user?.profileComplete ? 'Min $10.00' : 'Profile Required'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-amber-200">
          <CardContent className="p-4 text-center">
            <CreditCard className="h-6 w-6 mx-auto mb-2 text-warning" />
            <h3 className="font-semibold text-sm mb-1">PayPal</h3>
            <p className="text-xs text-muted-foreground mb-3">Cash out</p>
            <Button size="sm" variant="outline" disabled={!authState.user?.profileComplete} className="w-full text-xs">
              {authState.user?.profileComplete ? 'Min $10.00' : 'Profile Required'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Balance */}
      {balance && balance.pending_balance > 0 && (
        <Card className="bg-blue-50 border border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Pending Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between p-2 bg-background/50 rounded">
              <div>
                <p className="text-sm font-medium">${balance.pending_balance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Pending
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              💡 Earnings are reviewed and processed within 24-48 hours.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Redeem Info with Help */}
      <Card className="bg-amber-50 border border-amber-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">Payment Requirements</h3>
                <ContextualHelp 
                  content="We verify profiles to ensure secure payments and prevent fraud. This protects both you and other users in our community."
                  position="top"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                • Complete profile required for all withdrawals<br />
                • PayPal & Crypto: Minimum $10.00<br />
                • M-Pesa: Minimum $2.50<br />
                • Airtime: Minimum $5.00<br />
                • Payments processed within 24-48 hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactionsLoading ? (
            <div className="p-4">
              <SkeletonLoader variant="transaction" count={3} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-semibold mb-1">No transactions yet</p>
              <p className="text-xs mb-4">Start earning to see your transaction history!</p>
              <Button size="sm" onClick={() => window.location.hash = '#earn'}>
                Start Earning
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {transactions.slice(0, 10).map((transaction, index) => (
                <div key={transaction.id}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                          ? 'bg-success/10' 
                          : 'bg-destructive/10'
                      }`}>
                        {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                          ? 'text-success' 
                          : 'text-destructive'
                      }`}>
                        {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'outline' : 'secondary'}
                        className={transaction.status === 'completed' 
                          ? 'text-success border-success' 
                          : 'text-warning border-warning'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                  {index < Math.min(transactions.length, 10) - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earning Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">${balance?.total_earned?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-700">${balance?.available_balance?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">${balance?.lifetime_withdrawn?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Withdrawn</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-2xl font-bold text-amber-700">{transactions.length}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}