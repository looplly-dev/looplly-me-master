import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminResetPassword from '../AdminResetPassword';
import { supabase } from '@/integrations/supabase/client';

const mockNavigate = jest.fn();
const mockToast = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('AdminResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'admin@test.com' } },
      error: null,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AdminResetPassword />
      </BrowserRouter>
    );
  };

  it('should render password reset form', () => {
    renderComponent();

    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  it('should show validation errors for weak password', async () => {
    renderComponent();

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Set New Password/i });

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Password Requirements Not Met',
          variant: 'destructive',
        })
      );
    });
  });

  it('should show error when passwords do not match', async () => {
    renderComponent();

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Set New Password/i });

    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!@#' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Passwords do not match',
          variant: 'destructive',
        })
      );
    });
  });

  it('should successfully reset password and update team_profiles', async () => {
    const mockUpdateUser = supabase.auth.updateUser as jest.Mock;
    const mockSignOut = supabase.auth.signOut as jest.Mock;
    const mockFrom = supabase.from as jest.Mock;

    mockUpdateUser.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockInsert = jest.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'team_profiles') {
        return {
          update: mockUpdate,
          eq: mockEq,
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: mockInsert,
        };
      }
    });

    renderComponent();

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Set New Password/i });

    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!@#' } });
    fireEvent.change(confirmInput, { target: { value: 'ValidPass123!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'ValidPass123!@#',
      });
    });

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('team_profiles');
      expect(mockUpdate).toHaveBeenCalledWith({
        must_change_password: false,
        temp_password_expires_at: null,
      });
    });

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Password Updated',
      })
    );
  });

  it('should handle password update errors', async () => {
    const mockUpdateUser = supabase.auth.updateUser as jest.Mock;
    mockUpdateUser.mockResolvedValue({
      error: { message: 'Password update failed' },
    });

    renderComponent();

    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Set New Password/i });

    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!@#' } });
    fireEvent.change(confirmInput, { target: { value: 'ValidPass123!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to update password',
          variant: 'destructive',
        })
      );
    });
  });
});
