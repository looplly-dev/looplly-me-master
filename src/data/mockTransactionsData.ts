export interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'bonus' | 'referral';
  amount: number;
  currency: string;
  status: 'verified' | 'pending_verification' | 'processing' | 'failed';
  accountant_status: 'funds_received' | 'awaiting_funds' | 'verifying' | 'completed';
  description: string;
  method?: string;
  created_at: string;
  verified_at?: string;
  user_id: string;
}

// Mock transactions showing The Accountant AI verification process - matching Earn tab activities
export const mockTransactions: Transaction[] = [
  {
    id: '0',
    type: 'withdrawal',
    amount: 6.00,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Mobile Airtime Top-up',
    method: 'Mobile Airtime',
    created_at: '2024-01-20T10:30:00Z',
    verified_at: '2024-01-20T10:31:45Z',
    user_id: 'user1'
  },
  {
    id: '1',
    type: 'bonus',
    amount: 0.50,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Daily check-in bonus',
    created_at: '2024-01-20T09:00:00Z',
    verified_at: '2024-01-20T09:01:15Z',
    user_id: 'user1'
  },
  {
    id: '2',
    type: 'earning',
    amount: 0.15,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Quick Poll: Favorite Social Media Platform',
    created_at: '2024-01-20T08:45:00Z',
    verified_at: '2024-01-20T08:46:30Z',
    user_id: 'user1'
  },
  {
    id: '3',
    type: 'earning',
    amount: 2.50,
    currency: 'USD',
    status: 'pending_verification',
    accountant_status: 'funds_received',
    description: 'Shopping Preferences Survey - Research Co.',
    created_at: '2024-01-20T08:30:00Z',
    user_id: 'user1'
  },
  {
    id: '4',
    type: 'earning',
    amount: 1.75,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Food & Dining Survey - Consumer Insights',
    created_at: '2024-01-19T16:20:00Z',
    verified_at: '2024-01-19T16:22:45Z',
    user_id: 'user1'
  },
  {
    id: '5',
    type: 'earning',
    amount: 0.85,
    currency: 'USD',
    status: 'pending_verification',
    accountant_status: 'awaiting_funds',
    description: 'Product Demo: Smart Home - AdNetwork Pro',
    created_at: '2024-01-19T14:15:00Z',
    user_id: 'user1'
  },
  {
    id: '6',
    type: 'earning',
    amount: 4.50,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Website Testing Task - UX Research Lab',
    created_at: '2024-01-19T12:10:00Z',
    verified_at: '2024-01-19T12:14:20Z',
    user_id: 'user1'
  },
  {
    id: '7',
    type: 'earning',
    amount: 0.05,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Location Data Revenue Share - January',
    created_at: '2024-01-19T10:00:00Z',
    verified_at: '2024-01-19T10:00:30Z',
    user_id: 'user1'
  },
  {
    id: '8',
    type: 'referral',
    amount: 5.00,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Friend referral bonus - Sarah M.',
    created_at: '2024-01-18T15:30:00Z',
    verified_at: '2024-01-18T15:32:10Z',
    user_id: 'user1'
  },
  {
    id: '9',
    type: 'withdrawal',
    amount: 10.00,
    currency: 'USD',
    status: 'processing',
    accountant_status: 'verifying',
    description: 'M-Pesa withdrawal',
    method: 'M-Pesa',
    created_at: '2024-01-18T11:45:00Z',
    user_id: 'user1'
  },
  {
    id: '10',
    type: 'earning',
    amount: 1.25,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'App Review Task - PlayStore Feedback',
    created_at: '2024-01-18T09:20:00Z',
    verified_at: '2024-01-18T09:23:15Z',
    user_id: 'user1'
  }
];

export const getAccountantStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Verified by AI';
    case 'funds_received':
      return 'AI Processing';
    case 'awaiting_funds':
      return 'Awaiting Payment';
    case 'verifying':
      return 'AI Verifying';
    default:
      return 'Processing';
  }
};

export const getAccountantStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-success';
    case 'funds_received':
      return 'text-info';
    case 'awaiting_funds':
      return 'text-warning';
    case 'verifying':
      return 'text-accent';
    default:
      return 'text-muted-foreground';
  }
};