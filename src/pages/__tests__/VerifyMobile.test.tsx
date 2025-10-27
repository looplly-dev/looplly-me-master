import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import VerifyMobile from '../VerifyMobile';
import * as authHelper from '@/utils/authHelper';
import { supabase } from '@/integrations/supabase/client';

jest.mock('@/utils/authHelper');
jest.mock('@/integrations/supabase/client');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('VerifyMobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authHelper.getCurrentUserId as jest.Mock).mockResolvedValue('test-user-123');
    (authHelper.getCurrentUserMobile as jest.Mock).mockResolvedValue('+27823456789');
  });

  it('displays mobile number from authHelper', async () => {
    render(
      <BrowserRouter>
        <VerifyMobile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\+27823456789/)).toBeInTheDocument();
    });
  });

  it('accepts valid OTP and marks user as verified', async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate
    });

    render(
      <BrowserRouter>
        <VerifyMobile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\+27823456789/)).toBeInTheDocument();
    });

    // Enter valid OTP (12345)
    const inputs = screen.getAllByRole('textbox');
    const user = userEvent.setup();
    
    await user.type(inputs[0], '1');
    await user.type(inputs[1], '2');
    await user.type(inputs[2], '3');
    await user.type(inputs[3], '4');
    await user.type(inputs[4], '5');

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ is_verified: true });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('rejects invalid OTP', async () => {
    render(
      <BrowserRouter>
        <VerifyMobile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\+27823456789/)).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const user = userEvent.setup();
    
    // Enter invalid OTP
    await user.type(inputs[0], '0');
    await user.type(inputs[1], '0');
    await user.type(inputs[2], '0');
    await user.type(inputs[3], '0');
    await user.type(inputs[4], '0');

    await waitFor(() => {
      expect(screen.getByText(/Invalid Code/i)).toBeInTheDocument();
    });
  });

  it('handles missing user ID', async () => {
    (authHelper.getCurrentUserId as jest.Mock).mockResolvedValue(null);

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: new Error('Not authenticated') })
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate
    });

    render(
      <BrowserRouter>
        <VerifyMobile />
      </BrowserRouter>
    );

    const inputs = screen.getAllByRole('textbox');
    const user = userEvent.setup();
    
    await user.type(inputs[0], '1');
    await user.type(inputs[1], '2');
    await user.type(inputs[2], '3');
    await user.type(inputs[3], '4');
    await user.type(inputs[4], '5');

    await waitFor(() => {
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
    });
  });
});
