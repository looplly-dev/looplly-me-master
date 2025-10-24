import { renderHook, waitFor } from '@testing-library/react';
import { useBalance } from '../useBalance';
import { supabase } from '@/integrations/supabase/client';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

jest.mock('@/integrations/supabase/client');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    authState: { user: { id: 'test-user-id' } }
  })
}));

describe('useBalance', () => {
  const mockBalanceData = {
    user_id: 'test-user-id',
    lifetime_earnings: 100,
    balance: 50,
    pending_balance: 25,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock channel subscription
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    };
    mockSupabase.channel = jest.fn().mockReturnValue(mockChannel);
    mockSupabase.removeChannel = jest.fn();
  });

  it('should fetch and format balance data', async () => {
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockBalanceData, error: null })
        })
      })
    });

    const { result } = renderHook(() => useBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toEqual({
      total_earned: 100,
      available_balance: 50,
      pending_balance: 25,
      lifetime_withdrawn: 0
    });
  });

  it('should handle missing balance data with fallback', async () => {
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        })
      })
    });

    const { result } = renderHook(() => useBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toEqual({
      total_earned: 12.50,
      available_balance: 4.00,
      pending_balance: 2.50,
      lifetime_withdrawn: 6.00
    });
  });

  it('should handle fetch errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
        })
      })
    });

    const { result } = renderHook(() => useBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should provide refetch function', async () => {
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockBalanceData, error: null })
        })
      })
    });

    const { result } = renderHook(() => useBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
