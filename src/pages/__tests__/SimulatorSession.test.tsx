import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SimulatorSession from '../SimulatorSession';
import { supabase } from '@/integrations/supabase/client';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => {
    const params = new URLSearchParams(window.location.search);
    return [params];
  }
}));

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      setSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

describe('SimulatorSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Reset URL search params
    delete (window as any).location;
    (window as any).location = { search: '' };
  });

  it('should show loading state initially', () => {
    (window as any).location.search = '?token=test-token&stage=fresh_signup';
    
    (supabase.auth.setSession as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    expect(screen.getByText(/initializing simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/setting up test user session/i)).toBeInTheDocument();
  });

  it('should authenticate and navigate to correct route on success', async () => {
    (window as any).location.search = '?token=test-access-token&stage=fresh_signup';

    // Mock successful authentication
    (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'test-user-id' },
          access_token: 'test-access-token'
        }
      },
      error: null
    });

    // Mock profile check - user is test account
    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { is_test_account: true, user_type: 'looplly_user' },
        error: null
      })
    });

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(supabase.auth.setSession).toHaveBeenCalledWith({
        access_token: 'test-access-token',
        refresh_token: ''
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/register', { replace: true });
    }, { timeout: 1000 });
  });

  it('should show error when token is missing', async () => {
    (window as any).location.search = '?stage=fresh_signup'; // Missing token

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/simulator error/i)).toBeInTheDocument();
      expect(screen.getByText(/missing session token or stage parameter/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error when stage is missing', async () => {
    (window as any).location.search = '?token=test-token'; // Missing stage

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/simulator error/i)).toBeInTheDocument();
      expect(screen.getByText(/missing session token or stage parameter/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error when authentication fails', async () => {
    (window as any).location.search = '?token=invalid-token&stage=fresh_signup';

    (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid token' }
    });

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/simulator error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to authenticate simulator session/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error when target is not a test account', async () => {
    (window as any).location.search = '?token=test-token&stage=basic_profile';

    (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'real-user-id' },
          access_token: 'test-token'
        }
      },
      error: null
    });

    // Mock profile check - user is NOT a test account
    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { is_test_account: false, user_type: 'looplly_user' },
        error: null
      })
    });

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/simulator error/i)).toBeInTheDocument();
      expect(screen.getByText(/session is not for a test account/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard for established_user stage', async () => {
    (window as any).location.search = '?token=test-token&stage=established_user';

    (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'test-user-id' },
          access_token: 'test-token'
        }
      },
      error: null
    });

    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { is_test_account: true, user_type: 'looplly_user' },
        error: null
      })
    });

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    }, { timeout: 1000 });
  });

  it('should navigate to profile for basic_profile stage', async () => {
    (window as any).location.search = '?token=test-token&stage=basic_profile';

    (supabase.auth.setSession as jest.Mock).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'test-user-id' },
          access_token: 'test-token'
        }
      },
      error: null
    });

    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { is_test_account: true, user_type: 'looplly_user' },
        error: null
      })
    });

    render(
      <BrowserRouter>
        <SimulatorSession />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
    }, { timeout: 1000 });
  });
});
