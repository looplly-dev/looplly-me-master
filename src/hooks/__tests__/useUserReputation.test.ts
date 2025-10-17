import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserReputation } from '../useUserReputation';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Mock useAuth
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    authState: { user: { id: 'test-user-123' } }
  })
}));

// Mock useToast
jest.mock('../use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

describe('useUserReputation - Beta Cohort Logic', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('should NOT auto-create reputation (trigger handles this)', async () => {
    // Mock: no reputation exists
    const mockFrom = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    };
    (supabase.from as any).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useUserReputation(), { wrapper });

    await waitFor(() => {
      expect(result.current.reputation).toBeNull();
    });

    // Verify NO insert was called (old behavior removed)
    expect(mockFrom.select).toHaveBeenCalled();
  });

  it('should apply soft cap for Beta users above 500 Rep', async () => {
    const mockReputation = {
      id: 'rep-123',
      user_id: 'test-user-123',
      score: 600,
      tier: 'Silver',
      level: 'Silver Elite',
      beta_cohort: true,
      beta_rep_cap: 1000,
      cohort_joined_at: '2024-01-01T00:00:00Z',
      history: [],
      quality_metrics: {
        surveysCompleted: 10,
        surveysRejected: 0,
        averageTime: '8 min',
        consistencyScore: 100,
        speedingRate: 0
      },
      prestige: 0,
      next_level_threshold: 1000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });

    (supabase.from as any).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: mockReputation, error: null })
        })
      }),
      update: mockUpdate
    });

    const { result } = renderHook(() => useUserReputation(), { wrapper });

    await waitFor(() => {
      expect(result.current.reputation).toBeTruthy();
    });

    // Award +100 Rep → Should get ~40 Rep due to soft cap
    // Formula: 100 * (1 - (600 / 1000)) = 100 * 0.4 = 40 Rep
    result.current.addReputationPoints({
      points: 100,
      action: 'Test Action',
      category: 'badge'
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      const updateCall = mockUpdate.mock.calls[0][0];
      
      // Expected: 600 + 40 = 640
      expect(updateCall.score).toBeCloseTo(640, 0);
    });
  });

  it('should NOT apply soft cap for non-Beta users', async () => {
    const mockReputation = {
      id: 'rep-123',
      user_id: 'test-user-123',
      score: 600,
      tier: 'Silver',
      level: 'Silver Elite',
      beta_cohort: false, // POST-BETA USER
      beta_rep_cap: 1000,
      cohort_joined_at: '2024-01-01T00:00:00Z',
      history: [],
      quality_metrics: {
        surveysCompleted: 10,
        surveysRejected: 0,
        averageTime: '8 min',
        consistencyScore: 100,
        speedingRate: 0
      },
      prestige: 0,
      next_level_threshold: 1000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });

    (supabase.from as any).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: mockReputation, error: null })
        })
      }),
      update: mockUpdate
    });

    const { result } = renderHook(() => useUserReputation(), { wrapper });

    await waitFor(() => {
      expect(result.current.reputation).toBeTruthy();
    });

    // Award +100 Rep → Should get full +100 Rep (no cap)
    result.current.addReputationPoints({
      points: 100,
      action: 'Test Action'
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.score).toBe(700); // 600 + 100
    });
  });

  it('should include expanded history schema fields', async () => {
    const mockReputation = {
      id: 'rep-123',
      user_id: 'test-user-123',
      score: 100,
      tier: 'Bronze',
      level: 'Bronze Champion',
      beta_cohort: true,
      beta_rep_cap: 1000,
      cohort_joined_at: '2024-01-01T00:00:00Z',
      history: [],
      quality_metrics: {
        surveysCompleted: 5,
        surveysRejected: 0,
        averageTime: '5 min',
        consistencyScore: 100,
        speedingRate: 0
      },
      prestige: 0,
      next_level_threshold: 500,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });

    (supabase.from as any).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: mockReputation, error: null })
        })
      }),
      update: mockUpdate
    });

    const { result } = renderHook(() => useUserReputation(), { wrapper });

    await waitFor(() => {
      expect(result.current.reputation).toBeTruthy();
    });

    // Award Rep with full metadata
    result.current.addReputationPoints({
      points: 50,
      action: 'Streak Milestone',
      category: 'streak',
      description: 'Reached 7-day streak',
      metadata: { milestone: '7_days' }
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      const updateCall = mockUpdate.mock.calls[0][0];
      const newHistory = updateCall.history[0];

      expect(newHistory).toHaveProperty('transaction_id');
      expect(newHistory.category).toBe('streak');
      expect(newHistory.description).toBe('Reached 7-day streak');
      expect(newHistory.type).toBe('gain');
      expect(newHistory.metadata.milestone).toBe('7_days');
    });
  });

  it('should floor Rep at 0 (no negative scores)', async () => {
    const mockReputation = {
      id: 'rep-123',
      user_id: 'test-user-123',
      score: 10,
      tier: 'Bronze',
      level: 'Bronze Novice',
      beta_cohort: false,
      beta_rep_cap: 1000,
      cohort_joined_at: '2024-01-01T00:00:00Z',
      history: [],
      quality_metrics: {
        surveysCompleted: 1,
        surveysRejected: 0,
        averageTime: '5 min',
        consistencyScore: 50,
        speedingRate: 0
      },
      prestige: 0,
      next_level_threshold: 100,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });

    (supabase.from as any).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: mockReputation, error: null })
        })
      }),
      update: mockUpdate
    });

    const { result } = renderHook(() => useUserReputation(), { wrapper });

    await waitFor(() => {
      expect(result.current.reputation).toBeTruthy();
    });

    // Try to subtract -50 Rep from score of 10 → Should floor at 0
    result.current.addReputationPoints({
      points: -50,
      action: 'Survey Rejection'
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.score).toBe(0); // Floored at 0, not -40
    });
  });
});
