import { renderHook, waitFor } from '@testing-library/react';
import { useBadgeService } from '../useBadgeService';
import { supabase } from '@/integrations/supabase/client';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

jest.mock('@/integrations/supabase/client');

describe('useBadgeService', () => {
  const mockBadge = {
    id: 'badge-1',
    tenant_id: 'tenant-1',
    name: 'Test Badge',
    description: 'A test badge',
    tier: 'gold' as const,
    category: 'achievement',
    icon_url: 'https://example.com/badge.png',
    metadata: {},
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBadge', () => {
    it('should generate badge successfully', async () => {
      mockSupabase.functions.invoke = jest.fn().mockResolvedValue({
        data: { url: 'https://example.com/generated.png' },
        error: null
      });

      const { result } = renderHook(() => useBadgeService());

      let generatedData;
      await waitFor(async () => {
        generatedData = await result.current.generateBadge({
          badgeName: 'Test Badge',
          tier: 'gold',
        });
      });

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('generate-badge-image', {
        body: { badgeName: 'Test Badge', tier: 'gold' }
      });
      expect(generatedData).toEqual({ url: 'https://example.com/generated.png' });
    });

    it('should handle generation errors', async () => {
      mockSupabase.functions.invoke = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Generation failed')
      });

      const { result } = renderHook(() => useBadgeService());

      await expect(async () => {
        await result.current.generateBadge({ badgeName: 'Test', tier: 'bronze' });
      }).rejects.toThrow();
    });
  });

  describe('listBadges', () => {
    it('should list active badges', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockBadge], error: null })
          })
        })
      });

      const { result } = renderHook(() => useBadgeService());

      let badges;
      await waitFor(async () => {
        badges = await result.current.listBadges(true);
      });

      expect(badges).toEqual([mockBadge]);
    });

    it('should list all badges when activeOnly is false', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockBadge], error: null })
        })
      });

      const { result } = renderHook(() => useBadgeService());

      await waitFor(async () => {
        await result.current.listBadges(false);
      });

      const mockFrom = mockSupabase.from as jest.Mock;
      expect(mockFrom).toHaveBeenCalledWith('badge_catalog');
    });
  });

  describe('awardBadge', () => {
    it('should award badge to user', async () => {
      const mockUserBadge = {
        id: 'user-badge-1',
        user_id: 'user-1',
        badge_id: 'badge-1',
        awarded_at: '2024-01-01',
        metadata: {}
      };

      mockSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUserBadge, error: null })
          })
        })
      });

      const { result } = renderHook(() => useBadgeService());

      let awarded;
      await waitFor(async () => {
        awarded = await result.current.awardBadge('user-1', 'badge-1');
      });

      expect(awarded).toEqual(mockUserBadge);
    });

    it('should handle duplicate badge award', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: '23505' }
            })
          })
        })
      });

      const { result } = renderHook(() => useBadgeService());

      await expect(async () => {
        await result.current.awardBadge('user-1', 'badge-1');
      }).rejects.toThrow('Badge already awarded to this user');
    });
  });

  describe('getUserBadges', () => {
    it('should fetch user badges with badge details', async () => {
      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } }
      });

      const mockUserBadge = {
        id: 'user-badge-1',
        user_id: 'user-1',
        badge_id: 'badge-1',
        awarded_at: '2024-01-01',
        metadata: {},
        badge: mockBadge
      };

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockUserBadge], error: null })
          })
        })
      });

      const { result } = renderHook(() => useBadgeService());

      let badges;
      await waitFor(async () => {
        badges = await result.current.getUserBadges();
      });

      expect(badges).toEqual([mockUserBadge]);
    });
  });

  describe('updateBadge', () => {
    it('should update badge successfully', async () => {
      const updatedBadge = { ...mockBadge, name: 'Updated Badge' };

      mockSupabase.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedBadge, error: null })
            })
          })
        })
      });

      const { result } = renderHook(() => useBadgeService());

      let updated;
      await waitFor(async () => {
        updated = await result.current.updateBadge('badge-1', { name: 'Updated Badge' });
      });

      expect(updated).toEqual(updatedBadge);
    });
  });

  describe('toggleBadgeStatus', () => {
    it('should toggle badge active status', async () => {
      const toggledBadge = { ...mockBadge, is_active: false };

      mockSupabase.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: toggledBadge, error: null })
            })
          })
        })
      });

      const { result } = renderHook(() => useBadgeService());

      let toggled;
      await waitFor(async () => {
        toggled = await result.current.toggleBadgeStatus('badge-1', true);
      });

      expect(toggled?.is_active).toBe(false);
    });
  });

  describe('deleteBadge', () => {
    it('should delete badge and cleanup storage', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      });

      mockSupabase.storage.from = jest.fn().mockReturnValue({
        remove: jest.fn().mockResolvedValue({ error: null })
      });

      const { result } = renderHook(() => useBadgeService());

      await waitFor(async () => {
        await result.current.deleteBadge('badge-1', 'https://example.com/badge.png');
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('badges');
    });
  });
});
