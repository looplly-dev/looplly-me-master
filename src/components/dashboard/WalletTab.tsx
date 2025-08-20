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
  Bitcoin,
  Bot,
  Shield,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { mockTransactions, getAccountantStatusText, getAccountantStatusColor } from '@/data/mockTransactionsData';

export default function WalletTab() {
  const { balance, isLoading: balanceLoading } = useBalance();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { authState } = useAuth();

  // Use mock transactions for demonstration
  const displayTransactions = mockTransactions;

  if (balanceLoading) {
    return (
      <div className="p-6 pb-20 space-y-6">
        <SkeletonLoader variant="balance" />
        <SkeletonLoader variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="p-6 pb-20 space-y-6">
      {/* Premium Balance Hero */}
      <div className="relative overflow-hidden">
        <Card className="border-0 bg-gradient-to-br from-card via-card to-accent/5" style={{ boxShadow: 'var(--shadow-elegant)' }}>
          <CardContent className="p-8 text-center relative">
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 border border-success/20">
                <Bot className="h-3 w-3 text-success" />
                <span className="text-xs font-medium text-success">AI Secured</span>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-8 w-8 text-success" />
                <p className="text-5xl font-bold text-foreground tracking-tight">
                  {balance?.available_balance?.toFixed(2) || '245.75'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">${balance?.total_earned?.toFixed(2) || '312.50'} earned</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">${balance?.lifetime_withdrawn?.toFixed(2) || '66.75'} withdrawn</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The Accountant AI Status */}
      <Card className="border border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10 border border-accent/20">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm">The Accountant</p>
                <p className="text-xs text-muted-foreground">AI Payment Verification System</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle2 className="h-3 w-3 text-success" />
                <span className="text-xs font-medium text-success">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">Last check: 2m ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile completion warning */}
      {!authState.user?.profileComplete && (
        <Card className="border border-warning/20 bg-gradient-to-r from-warning/5 to-warning/10" style={{ boxShadow: 'var(--shadow-card)' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-warning/10 border border-warning/20">
              <Shield className="h-4 w-4 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Profile Verification Required</p>
              <p className="text-xs text-muted-foreground">Complete profile to enable withdrawals</p>
            </div>
            <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 font-medium">
              Verify Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Premium Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cash Out Options</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { 
              icon: Smartphone, 
              label: 'Mobile Airtime', 
              min: '$5.00', 
              color: 'from-primary/10 to-primary/20',
              borderColor: 'border-primary/20',
              iconBg: 'bg-primary/10',
              iconColor: 'text-primary',
              disabled: !authState.user?.profileComplete 
            },
            { 
              icon: '📱', 
              label: 'M-Pesa', 
              min: '$2.50', 
              color: 'from-mpesa/10 to-mpesa/20',
              borderColor: 'border-mpesa/20',
              iconBg: 'bg-mpesa/10',
              iconColor: 'text-mpesa',
              disabled: !authState.user?.profileComplete 
            },
            { 
              icon: Bitcoin, 
              label: 'Cryptocurrency', 
              min: '$10.00', 
              color: 'from-crypto/10 to-crypto/20',
              borderColor: 'border-crypto/20',
              iconBg: 'bg-crypto/10',
              iconColor: 'text-crypto',
              disabled: !authState.user?.profileComplete 
            },
            { 
              icon: CreditCard, 
              label: 'PayPal', 
              min: '$10.00', 
              color: 'from-accent/10 to-accent/20',
              borderColor: 'border-accent/20',
              iconBg: 'bg-accent/10',
              iconColor: 'text-accent',
              disabled: !authState.user?.profileComplete 
            }
          ].map((action, index) => (
            <Card 
              key={index} 
              className={`border ${action.borderColor} bg-gradient-to-br ${action.color} transition-all hover:scale-[1.02] hover:shadow-lg ${
                action.disabled ? 'opacity-60' : ''
              }`}
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-full ${action.iconBg} border ${action.borderColor}`}>
                    {typeof action.icon === 'string' ? (
                      <span className="text-lg">{action.icon}</span>
                    ) : (
                      <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.disabled ? 'Verification required' : `Min ${action.min}`}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  disabled={action.disabled}
                  className={`w-full font-medium ${
                    action.disabled 
                      ? 'bg-muted text-muted-foreground' 
                      : `${action.iconColor.replace('text-', 'bg-')} text-white hover:opacity-90`
                  }`}
                >
                  {action.disabled ? 'Locked' : 'Cash Out'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI-Managed Pending Balance */}
      <Card className="border border-info/20 bg-gradient-to-r from-info/5 to-info/10" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-info/10 border border-info/20">
              <Clock className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-sm font-semibold">${balance?.pending_balance?.toFixed(2) || '28.75'} Under Review</p>
              <p className="text-xs text-muted-foreground">The Accountant is verifying payments</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
            AI Processing
          </Badge>
        </CardContent>
      </Card>

      {/* Smart Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <Button variant="ghost" size="sm" className="text-accent font-medium">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {displayTransactions.slice(0, 6).map((transaction) => (
            <Card 
              key={transaction.id} 
              className="border border-muted/20 bg-card transition-all hover:shadow-md hover:scale-[1.01]"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full border ${
                      transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-accent/10 border-accent/20'
                    }`}>
                      {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3 text-accent" />
                          <span className={`text-xs font-medium ${getAccountantStatusColor(transaction.accountant_status)}`}>
                            {getAccountantStatusText(transaction.accountant_status)}
                          </span>
                        </div>
                      </div>
                      {transaction.method && (
                        <p className="text-xs text-muted-foreground mt-1">via {transaction.method}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                        ? 'text-success' 
                        : 'text-accent'
                    }`}>
                      {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        transaction.status === 'verified' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : transaction.status === 'pending_verification'
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-info/10 text-info border-info/20'
                      }`}
                    >
                      {transaction.status === 'verified' ? 'Complete' : 
                       transaction.status === 'pending_verification' ? 'Pending' : 'Processing'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Payment Intelligence */}
      <Card className="border border-muted/20 bg-gradient-to-br from-card to-muted/5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <details>
          <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10 border border-accent/20">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className="text-sm font-semibold">How The Accountant Works</span>
                <p className="text-xs text-muted-foreground">AI-powered payment verification</p>
              </div>
              <ContextualHelp 
                content="Our AI system verifies that all payments are received before distributing rewards, ensuring complete transparency and security."
                position="top"
              />
            </div>
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Smart Verification</p>
                  <p className="text-xs">AI monitors business accounts for incoming payments</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Fraud Protection</p>
                  <p className="text-xs">Only verified payments trigger reward distribution</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Real-time Processing</p>
                  <p className="text-xs">Payments verified and released within minutes</p>
                </div>
              </div>
            </div>
          </div>
        </details>
      </Card>
    </div>
  );
}