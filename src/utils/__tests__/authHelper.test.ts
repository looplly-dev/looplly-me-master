import { getCurrentUserId, getCurrentUserMobile } from '../authHelper';
import { supabase } from '@/integrations/supabase/client';

jest.mock('@/integrations/supabase/client');

describe('authHelper', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('getCurrentUserId', () => {
    it('returns user ID from simulator session storage', async () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { pathname: '/simulator/dashboard' },
        writable: true,
        configurable: true
      });

      sessionStorage.setItem('simulator_user', JSON.stringify({
        user_id: 'sim-123',
        mobile: '+27823456789'
      }));

      const userId = await getCurrentUserId();
      expect(userId).toBe('sim-123');
    });

    it('returns user ID from Looplly JWT local storage', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
        configurable: true
      });

      localStorage.setItem('looplly_user', JSON.stringify({
        id: 'looplly-456',
        mobile: '+27823456789'
      }));

      const userId = await getCurrentUserId();
      expect(userId).toBe('looplly-456');
    });

    it('returns user ID from Supabase Auth', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/dashboard' },
        writable: true,
        configurable: true
      });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'team-789' } }
      });

      const userId = await getCurrentUserId();
      expect(userId).toBe('team-789');
    });

    it('returns null when no auth found', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
        configurable: true
      });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      const userId = await getCurrentUserId();
      expect(userId).toBeNull();
    });

    it('handles malformed simulator_user JSON gracefully', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/simulator/dashboard' },
        writable: true,
        configurable: true
      });

      sessionStorage.setItem('simulator_user', 'invalid-json');

      const userId = await getCurrentUserId();
      expect(userId).toBeNull();
    });
  });

  describe('getCurrentUserMobile', () => {
    it('returns mobile from simulator snapshot', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/simulator/dashboard' },
        writable: true,
        configurable: true
      });

      sessionStorage.setItem('simulator_user', JSON.stringify({
        user_id: 'sim-123',
        mobile: '+27823456789'
      }));

      const mobile = await getCurrentUserMobile();
      expect(mobile).toBe('+27823456789');
    });

    it('returns mobile from Looplly user snapshot', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
        configurable: true
      });

      localStorage.setItem('looplly_user', JSON.stringify({
        id: 'looplly-456',
        mobile: '+27811222333'
      }));

      const mobile = await getCurrentUserMobile();
      expect(mobile).toBe('+27811222333');
    });

    it('fetches mobile from DB when not in Looplly snapshot', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
        configurable: true
      });

      localStorage.setItem('looplly_user', JSON.stringify({
        id: 'looplly-456'
        // mobile not present
      }));

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { mobile: '+27899999999' }
            })
          })
        })
      });

      (supabase.from as jest.Mock) = mockFrom;

      const mobile = await getCurrentUserMobile();
      expect(mobile).toBe('+27899999999');
    });

    it('returns null when no mobile found', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
        configurable: true
      });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      });

      const mobile = await getCurrentUserMobile();
      expect(mobile).toBeNull();
    });
  });
});
