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

// Mock transactions showing The Accountant AI verification process
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earning',
    amount: 15.50,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Survey completion reward',
    created_at: '2024-01-20T14:30:00Z',
    verified_at: '2024-01-20T14:32:15Z',
    user_id: 'user1'
  },
  {
    id: '2',
    type: 'bonus',
    amount: 5.00,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Welcome bonus',
    created_at: '2024-01-20T10:15:00Z',
    verified_at: '2024-01-20T10:16:45Z',
    user_id: 'user1'
  },
  {
    id: '3',
    type: 'earning',
    amount: 8.25,
    currency: 'USD',
    status: 'pending_verification',
    accountant_status: 'awaiting_funds',
    description: 'Product testing reward',
    created_at: '2024-01-20T09:45:00Z',
    user_id: 'user1'
  },
  {
    id: '4',
    type: 'withdrawal',
    amount: 25.00,
    currency: 'USD',
    status: 'processing',
    accountant_status: 'verifying',
    description: 'M-Pesa withdrawal',
    method: 'M-Pesa',
    created_at: '2024-01-19T16:20:00Z',
    user_id: 'user1'
  },
  {
    id: '5',
    type: 'referral',
    amount: 10.00,
    currency: 'USD',
    status: 'verified',
    accountant_status: 'completed',
    description: 'Friend referral bonus',
    created_at: '2024-01-19T12:10:00Z',
    verified_at: '2024-01-19T12:12:30Z',
    user_id: 'user1'
  },
  {
    id: '6',
    type: 'earning',
    amount: 12.75,
    currency: 'USD',  
    status: 'pending_verification',
    accountant_status: 'funds_received',
    description: 'App review reward',
    created_at: '2024-01-19T08:30:00Z',
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