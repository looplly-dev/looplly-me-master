import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfileComplete from '../ProfileComplete';
import * as authHelper from '@/utils/authHelper';
import { supabase } from '@/integrations/supabase/client';

jest.mock('@/utils/authHelper');
jest.mock('@/integrations/supabase/client');
jest.mock('@/hooks/useProfileQuestions', () => ({
  useProfileQuestions: () => ({
    level2Categories: [
      {
        id: 'cat1',
        name: 'Demographics',
        questions: [
          {
            id: 'q1',
            question_key: 'gender',
            question_text: 'What is your gender?',
            input_type: 'single_choice',
            is_required: true,
            options: ['male', 'female', 'other']
          }
        ]
      }
    ],
    refetch: jest.fn()
  })
}));

describe('ProfileComplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authHelper.getCurrentUserId as jest.Mock).mockResolvedValue('test-user-123');
  });

  it('loads questions and displays them', async () => {
    render(
      <BrowserRouter>
        <ProfileComplete />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/What is your gender/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (authHelper.getCurrentUserId as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ProfileComplete />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading questions/i)).toBeInTheDocument();
  });

  it('handles missing user ID gracefully', async () => {
    (authHelper.getCurrentUserId as jest.Mock).mockResolvedValue(null);

    const mockUpsert = jest.fn().mockResolvedValue({ error: new Error('Not authenticated') });
    (supabase.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert
    });

    render(
      <BrowserRouter>
        <ProfileComplete />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(authHelper.getCurrentUserId).toHaveBeenCalled();
    });
  });
});
