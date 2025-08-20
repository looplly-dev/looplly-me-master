import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  CreditCard,
  AlertCircle,
  ChevronRight,
  Bitcoin
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
    <div className="p-4 pb-20 space-y-4">
      {/* Hero Balance */}
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold mb-1 text-foreground">${balance?.available_balance?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-muted-foreground">
            ${balance?.total_earned?.toFixed(2) || '0.00'} earned • ${balance?.lifetime_withdrawn?.toFixed(2) || '0.00'} withdrawn
          </p>
        </CardContent>
      </Card>

      {/* Profile completion warning */}
      {!authState.user?.profileComplete && (
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Complete profile to withdraw</p>
            </div>
            <Button size="sm" className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Smartphone, label: 'Airtime', min: '$5.00', disabled: !authState.user?.profileComplete },
            { icon: '📱', label: 'M-Pesa', min: '$2.50', disabled: !authState.user?.profileComplete },
            { icon: Bitcoin, label: 'Crypto', min: '$10.00', disabled: !authState.user?.profileComplete },
            { icon: CreditCard, label: 'PayPal', min: '$10.00', disabled: !authState.user?.profileComplete }
          ].map((action, index) => (
            <Card key={index} className={`border-l-4 border-l-primary shadow-sm transition-all hover:shadow-md ${action.disabled ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {typeof action.icon === 'string' ? (
                      <span className="text-lg">{action.icon}</span>
                    ) : (
                      <action.icon className="h-5 w-5 text-foreground" />
                    )}
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {action.disabled ? 'Profile required' : action.min}
                  </span>
                  <Button 
                    size="sm" 
                    disabled={action.disabled}
                    className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                  >
                    {action.disabled ? 'Locked' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending Balance - if exists */}
      {balance && balance.pending_balance > 0 && (
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">${balance.pending_balance.toFixed(2)} pending</p>
              <p className="text-xs text-muted-foreground">Processing within 24-48hrs</p>
            </div>
            <Badge variant="secondary" className="text-xs">Pending</Badge>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Recent Activity</h3>
          {transactions.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
        
        {transactionsLoading ? (
          <div className="space-y-3">
            <SkeletonLoader variant="transaction" count={3} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm mb-1">No transactions yet</p>
            <p className="text-xs mb-3">Start earning to see your activity!</p>
            <Button size="sm" onClick={() => window.location.hash = '#earn'} className="h-7 text-xs">
              Start Earning
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <Card key={transaction.id} className="border-l-4 border-l-primary shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                          ? 'bg-success/10 border border-success/20' 
                          : 'bg-destructive/10 border border-destructive/20'
                      }`}>
                        {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? (
                          <ArrowDownLeft className="h-3 w-3 text-success" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                          ? 'text-success' 
                          : 'text-destructive'
                      }`}>
                        {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Info - Collapsible */}
      <Card className="border-l-4 border-l-primary shadow-sm">
        <details>
          <summary className="p-3 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Payment Requirements</span>
              <ContextualHelp 
                content="We verify profiles to ensure secure payments and prevent fraud. This protects both you and other users in our community."
                position="top"
              />
            </div>
          </summary>
          <div className="px-3 pb-3 text-xs text-muted-foreground space-y-1">
            <p>• Complete profile required for all withdrawals</p>
            <p>• PayPal & Crypto: Minimum $10.00</p>
            <p>• M-Pesa: Minimum $2.50 • Airtime: Minimum $5.00</p>
            <p>• Payments processed within 24-48 hours</p>
          </div>
        </details>
      </Card>
    </div>
  );
}