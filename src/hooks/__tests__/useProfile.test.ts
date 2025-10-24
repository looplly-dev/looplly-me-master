import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from '../useProfile';
import { supabase } from '@/integrations/supabase/client';
import * as profileUtils from '@/utils/profile';
import * as validation from '@/utils/validation';

jest.mock('@/integrations/supabase/client');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    authState: { user: { id: 'test-user-id' } }
  })
}));
jest.mock('@/hooks/useUserType', () => ({
  useUserType: () => ({ isTeamMember: () => false })
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

describe('useProfile', () => {
  const mockProfileData = {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    dateOfBirth: '1990-01-01',
    address: '123 Main St',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully complete profile with valid data', async () => {
    const mockValidate = jest.spyOn(validation, 'validateProfile').mockReturnValue({
      isValid: true,
      errors: []
    });
    const mockUpdate = jest.spyOn(profileUtils, 'updateUserProfile').mockResolvedValue(true);

    const { result } = renderHook(() => useProfile());

    let success;
    await waitFor(async () => {
      success = await result.current.completeProfile(mockProfileData);
    });

    expect(mockValidate).toHaveBeenCalledWith(mockProfileData);
    expect(mockUpdate).toHaveBeenCalledWith('test-user-id', mockProfileData);
    expect(success).toBe(true);
  });

  it('should handle validation errors', async () => {
    const mockValidate = jest.spyOn(validation, 'validateProfile').mockReturnValue({
      isValid: false,
      errors: ['First name is required']
    });

    const { result } = renderHook(() => useProfile());

    let success;
    await waitFor(async () => {
      success = await result.current.completeProfile({ ...mockProfileData, firstName: '' });
    });

    expect(success).toBe(false);
  });

  it('should handle profile update failure', async () => {
    jest.spyOn(validation, 'validateProfile').mockReturnValue({ isValid: true, errors: [] });
    jest.spyOn(profileUtils, 'updateUserProfile').mockResolvedValue(false);

    const { result } = renderHook(() => useProfile());

    let success;
    await waitFor(async () => {
      success = await result.current.completeProfile(mockProfileData);
    });

    expect(success).toBe(false);
  });

  it('should track submission state', async () => {
    jest.spyOn(validation, 'validateProfile').mockReturnValue({ isValid: true, errors: [] });
    jest.spyOn(profileUtils, 'updateUserProfile').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );

    const { result } = renderHook(() => useProfile());

    expect(result.current.isSubmitting).toBe(false);

    const promise = result.current.completeProfile(mockProfileData);
    
    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });

    await promise;

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
