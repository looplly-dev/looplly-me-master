// Helper functions for transaction data

export const getAccountantStatusText = (status: string): string => {
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

export const getAccountantStatusColor = (status: string): string => {
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
