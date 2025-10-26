import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SimulatorDashboard from '../SimulatorDashboard';
import { supabase } from '@/integrations/supabase/client';

// Mock child components
jest.mock('../UserSelector', () => ({
  __esModule: true,
  default: ({ onUserSelect }: any) => (
    <button onClick={() => onUserSelect('test-user-123')}>Select User</button>
  )
}));

jest.mock('../StageSelector', () => ({
  __esModule: true,
  default: ({ onStageSelect, disabled }: any) => (
    <button onClick={() => onStageSelect('fresh_signup')} disabled={disabled}>
      Select Stage
    </button>
  )
}));

jest.mock('../SimulatorIframe', () => ({
  __esModule: true,
  default: ({ sessionToken, stage }: any) => (
    <div data-testid="simulator-iframe">
      Token: {sessionToken}, Stage: {stage}
    </div>
  )
}));

jest.mock('../StateInspector', () => ({
  __esModule: true,
  default: ({ userId }: any) => (
    <div data-testid="state-inspector">User: {userId}</div>
  )
}));

jest.mock('../SeedTestUsersButton', () => ({
  __esModule: true,
  default: () => <button>Seed Test Users</button>
}));

// Mock hooks
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

describe('SimulatorDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error toast when edge function fails', async () => {
    const user = userEvent.setup();
    
    (supabase.functions.invoke as jest.Mock).mockRejectedValueOnce(
      new Error('Edge Function returned a non-2xx status code')
    );

    render(<SimulatorDashboard />);

    // Select user and stage
    await user.click(screen.getByText('Select User'));
    await user.click(screen.getByText('Select Stage'));

    // Click Start Simulation
    const startButton = screen.getByText('Start Simulation');
    await user.click(startButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Simulation Failed',
        description: expect.stringContaining('Failed to start simulation'),
        variant: 'destructive'
      });
    });

    // Should not show Live Simulator tab
    expect(screen.queryByText('Live Simulator')).not.toBeInTheDocument();
  });

  it('should show success toast and render simulator iframe on success', async () => {
    const user = userEvent.setup();
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        session_token: 'test-token-abc-123',
        test_user: {
          id: 'user-1',
          name: 'Alex Johnson',
          email: 'alex@test.com'
        },
        stage_info: {
          stage: 'fresh_signup',
          description: 'New account, no data'
        }
      },
      error: null
    });

    render(<SimulatorDashboard />);

    // Select user and stage
    await user.click(screen.getByText('Select User'));
    await user.click(screen.getByText('Select Stage'));

    // Click Start Simulation
    const startButton = screen.getByText('Start Simulation');
    await user.click(startButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Simulation Started',
        description: expect.stringContaining('Alex Johnson')
      });
    });

    // Should show Live Simulator tab
    expect(screen.getByText('Live Simulator')).toBeInTheDocument();
    expect(screen.getByText('User State Inspector')).toBeInTheDocument();

    // Should render iframe with correct props
    expect(screen.getByTestId('simulator-iframe')).toHaveTextContent('Token: test-token-abc-123');
    expect(screen.getByTestId('simulator-iframe')).toHaveTextContent('Stage: fresh_signup');
  });

  it('should require both user and stage selection before starting', async () => {
    const user = userEvent.setup();
    
    render(<SimulatorDashboard />);

    // Try to start without selecting anything
    expect(screen.queryByText('Start Simulation')).not.toBeInTheDocument();

    // Select only user
    await user.click(screen.getByText('Select User'));
    expect(screen.queryByText('Start Simulation')).not.toBeInTheDocument();

    // Select stage
    await user.click(screen.getByText('Select Stage'));
    
    // Now Start Simulation button should appear
    expect(screen.getByText('Start Simulation')).toBeInTheDocument();
  });

  it('should handle edge function error response', async () => {
    const user = userEvent.setup();
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        success: false,
        error: 'Insufficient permissions'
      },
      error: null
    });

    render(<SimulatorDashboard />);

    await user.click(screen.getByText('Select User'));
    await user.click(screen.getByText('Select Stage'));
    await user.click(screen.getByText('Start Simulation'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Simulation Failed',
        description: 'Insufficient permissions',
        variant: 'destructive'
      });
    });
  });
});
