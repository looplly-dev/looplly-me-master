import { renderHook, waitFor } from '@testing-library/react';
import { useRole } from '../useRole';
import { supabase } from '@/integrations/supabase/client';

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    authState: {
      user: { id: 'test-user-id' }
    }
  })
}));

describe('useRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should recognize tester role and hierarchy', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { role: 'tester' },
        error: null
      })
    });

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('tester');
    expect(result.current.hasRole('tester')).toBe(true);
    expect(result.current.hasRole('user')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
    expect(result.current.isTester()).toBe(true);
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.getRoleLevel()).toBe(1.5);
  });

  it('should recognize admin role has higher privileges than tester', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { role: 'admin' },
        error: null
      })
    });

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('tester')).toBe(true);
    expect(result.current.hasRole('user')).toBe(true);
    expect(result.current.hasRole('super_admin')).toBe(false);
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isTester()).toBe(true);
    expect(result.current.getRoleLevel()).toBe(2);
  });

  it('should recognize super_admin has all privileges', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { role: 'super_admin' },
        error: null
      })
    });

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('super_admin');
    expect(result.current.hasRole('super_admin')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('tester')).toBe(true);
    expect(result.current.hasRole('user')).toBe(true);
    expect(result.current.isSuperAdmin()).toBe(true);
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.getRoleLevel()).toBe(3);
  });

  it('should default to user role when no role found', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      })
    });

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('user');
    expect(result.current.hasRole('user')).toBe(true);
    expect(result.current.hasRole('tester')).toBe(false);
    expect(result.current.getRoleLevel()).toBe(1);
  });
});
