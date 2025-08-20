import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
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
  TrendingUp,
  History
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

  // Minimum cash-out amounts for each method
  const cashOutMinimums = {
    'Mobile Airtime': 1.00,
    'M-Pesa': 5.00,
    'Cryptocurrency': 10.00,
    'PayPal': 5.00
  };

  const getCashOutStatus = (method: string) => {
    const minimum = cashOutMinimums[method as keyof typeof cashOutMinimums];
    const currentBalance = balance?.available_balance || 0;
    
    if (!authState.user?.profileComplete) {
      return { disabled: true, reason: 'Profile verification required' };
    }
    
    if (currentBalance < minimum) {
      const needed = minimum - currentBalance;
      return { disabled: true, reason: `Need $${needed.toFixed(2)} more (Min: $${minimum.toFixed(2)})` };
    }
    
    return { disabled: false, reason: null };
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Balance Hero Section */}
      <Card className="border-0 shadow-lg bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-primary text-sm font-medium">AI Secured</span>
              </div>
              <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-foreground">
                ${balance?.available_balance?.toFixed(2) || '0.00'}
              </p>
              <p className="text-muted-foreground text-xs">USD</p>
            </div>
            <div className="text-right">
              <Wallet className="h-12 w-12 text-muted-foreground/40 mb-2" />
              <div className="text-muted-foreground text-xs space-y-1">
                <div>Earned: ${balance?.total_earned?.toFixed(2) || '0.00'}</div>
                <div>Withdrawn: ${balance?.lifetime_withdrawn?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Accountant Status */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border border-background flex items-center justify-center">
                <CheckCircle2 className="h-2 w-2 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm flex items-center gap-2">
                The Accountant
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </h3>
              <p className="text-xs text-muted-foreground">
                AI monitoring all transactions
              </p>
            </div>
            <Badge variant="outline" className="text-success border-success text-xs">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile completion warning */}
      {!authState.user?.profileComplete && (
        <Card className="border border-warning/20 bg-warning/10">
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

      {/* Cash Out Options */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-primary" />
          Cash Out Options
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { name: 'Mobile Airtime', icon: '📱', available: true, short: 'Airtime' },
            { name: 'M-Pesa', icon: '💚', available: true, short: 'M-Pesa' },
            { name: 'Cryptocurrency', icon: '₿', available: true, short: 'Crypto' },
            { name: 'PayPal', icon: '💙', available: false, short: 'PayPal' }
          ].map((method) => {
            const status = getCashOutStatus(method.name);
            const isUnavailable = !method.available;
            
            return (
              <Card key={method.name} className={`flex-shrink-0 w-32 cursor-pointer transition-all hover:shadow-md ${status.disabled || isUnavailable ? 'opacity-60' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-center text-lg mb-2 h-8">
                    {method.icon}
                  </div>
                  <h3 className="font-medium text-xs text-center mb-1">{method.short}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-2 leading-tight">
                    {method.name === 'Mobile Airtime' && `Min $${cashOutMinimums[method.name].toFixed(2)}`}
                    {method.name === 'M-Pesa' && `Min $${cashOutMinimums[method.name].toFixed(2)}`}
                    {method.name === 'Cryptocurrency' && `Min $${cashOutMinimums[method.name].toFixed(2)}`}
                    {method.name === 'PayPal' && 'Coming Soon'}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full text-xs h-7" 
                    disabled={status.disabled || isUnavailable}
                    variant={status.disabled || isUnavailable ? 'secondary' : 'default'}
                  >
                    {isUnavailable ? 'Soon' : status.disabled ? 'Available' : 'Cash Out'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI-Managed Pending Balance */}
      <Card className="border-muted">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">${balance?.pending_balance?.toFixed(2) || '0.00'} Under Review</p>
              <p className="text-xs text-muted-foreground">The Accountant is verifying payments</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            AI Processing
          </Badge>
        </CardContent>
      </Card>

      {/* Transaction History - Collapsible */}
      <CollapsibleSection
        title={`Recent Transactions (${displayTransactions.length})`}
        icon={<History className="h-4 w-4" />}
        defaultOpen={false}
        compactContent={
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Latest Activity</span>
              <span className="text-success font-medium">
                +${displayTransactions.slice(0, 3).reduce((sum, t) => 
                  (t.type === 'earning' || t.type === 'bonus' || t.type === 'referral') 
                    ? sum + t.amount : sum, 0).toFixed(2)}
              </span>
            </div>
            {displayTransactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                      ? 'bg-success' : 'bg-muted-foreground'
                  }`} />
                  <span className="text-sm truncate">{transaction.description}</span>
                </div>
                <span className={`text-xs font-medium ${
                  transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                    ? 'text-success' : 'text-muted-foreground'
                }`}>
                  {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {displayTransactions.slice(0, 6).map((transaction) => (
            <Card 
              key={transaction.id} 
              className="border border-muted/20 bg-card transition-all hover:shadow-md hover:scale-[1.01]"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full border ${
                      transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral'
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-muted/50 border-muted'
                    }`}>
                      {transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'referral' ? (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
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
                          <Bot className="h-3 w-3 text-primary" />
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
                        : 'text-muted-foreground'
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
                          : 'bg-primary/10 text-primary border-primary/20'
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
          
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" className="text-accent font-medium">
              View All Transactions <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CollapsibleSection>

      {/* AI Payment Intelligence */}
      <Card className="border border-muted/20 bg-card">
        <details>
          <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                <Bot className="h-4 w-4 text-primary" />
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
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Fraud Protection</p>
                  <p className="text-xs">Only verified payments trigger reward distribution</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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