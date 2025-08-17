import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { mockTransactions, userStats } from '@/data/mockData';

export default function WalletTab() {
  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Balance Overview */}
      <Card className="bg-gradient-to-r from-success to-success-glow text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Available Balance</p>
              <p className="text-4xl font-bold">{userStats.currentBalance}</p>
              <p className="text-white/80 text-sm">USD</p>
            </div>
            <Wallet className="h-12 w-12 text-white/60" />
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-white/20">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Lifetime earnings: {userStats.totalEarnings} USD</span>
          </div>
        </CardContent>
      </Card>

      {/* KYC Requirement Banner */}
      {!userStats.kyc.verified && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">KYC Verification Required</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Complete identity verification with {userStats.kyc.provider} to unlock withdrawals and build reputation.
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Verify Identity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <Smartphone className="h-6 w-6 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm mb-1">Airtime</h3>
            <p className="text-xs text-muted-foreground mb-3">Mobile top-up</p>
            <Button size="sm" variant="outline" disabled={!userStats.kyc.verified} className="w-full text-xs">
              {userStats.kyc.verified ? 'Min $5.00' : 'KYC Required'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-mpesa/5 to-mpesa/10 border-mpesa/20">
          <CardContent className="p-4 text-center">
            <div className="text-lg mb-2">📱</div>
            <h3 className="font-semibold text-sm mb-1">M-Pesa</h3>
            <p className="text-xs text-muted-foreground mb-3">Mobile money</p>
            <Button size="sm" variant="outline" disabled={!userStats.kyc.verified} className="w-full text-xs">
              {userStats.kyc.verified ? 'Min $2.50' : 'KYC Required'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-crypto/5 to-crypto/10 border-crypto/20">
          <CardContent className="p-4 text-center">
            <div className="text-lg mb-2">₿</div>
            <h3 className="font-semibold text-sm mb-1">Crypto</h3>
            <p className="text-xs text-muted-foreground mb-3">Bitcoin/USDT</p>
            <Button size="sm" variant="outline" disabled={!userStats.kyc.verified} className="w-full text-xs">
              {userStats.kyc.verified ? 'Min $10.00' : 'KYC Required'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4 text-center">
            <CreditCard className="h-6 w-6 mx-auto mb-2 text-warning" />
            <h3 className="font-semibold text-sm mb-1">PayPal</h3>
            <p className="text-xs text-muted-foreground mb-3">Cash out</p>
            <Button size="sm" variant="outline" disabled={!userStats.kyc.verified} className="w-full text-xs">
              {userStats.kyc.verified ? 'Min $10.00' : 'KYC Required'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {userStats.pendingPayments.length > 0 && (
        <Card className="border-info/50 bg-info/5">
          <CardHeader>
            <CardTitle className="text-sm">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {userStats.pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                  <div>
                    <p className="text-sm font-medium">{payment.amount}</p>
                    <p className="text-xs text-muted-foreground">{payment.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                    <Badge variant="secondary" className="text-xs">
                      {payment.status === 'awaiting_revenue' ? 'Awaiting Revenue' : 'Processing'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              💡 Payments are processed when company revenue is received from completed surveys.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Redeem Info */}
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Payment Requirements</h3>
              <p className="text-xs text-muted-foreground">
                • KYC verification required for all withdrawals<br />
                • PayPal & Crypto: Minimum $10.00<br />
                • M-Pesa: Minimum $2.50<br />
                • Airtime: Minimum $5.00<br />
                • Payments released when revenue is received
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
          <div className="space-y-0">
            {mockTransactions.map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'earn' 
                        ? 'bg-success/10' 
                        : 'bg-destructive/10'
                    }`}>
                      {transaction.type === 'earn' ? (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'earn' 
                        ? 'text-success' 
                        : 'text-destructive'
                    }`}>
                      {transaction.type === 'earn' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
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
                {index < mockTransactions.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earning Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{userStats.surveysCompleted}</p>
              <p className="text-sm text-muted-foreground">Surveys Completed</p>
            </div>
            <div className="text-center p-3 bg-accent/5 rounded-lg">
              <p className="text-2xl font-bold text-accent">{userStats.videosWatched}</p>
              <p className="text-sm text-muted-foreground">Videos Watched</p>
            </div>
            <div className="text-center p-3 bg-success/5 rounded-lg">
              <p className="text-2xl font-bold text-success">{userStats.tasksCompleted}</p>
              <p className="text-sm text-muted-foreground">Tasks Done</p>
            </div>
            <div className="text-center p-3 bg-warning/5 rounded-lg">
              <p className="text-2xl font-bold text-warning">{userStats.checkInStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}