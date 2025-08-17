import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';
import { AuthContext } from '@/hooks/useAuth';
import { AuthState } from '@/types/auth';

const mockAuthContext = {
  authState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    step: 'login' as const,
  } as AuthState,
  login: jest.fn(),
  verifyOTP: jest.fn(),
  register: jest.fn(),
  completeProfile: jest.fn(),
  updateCommunicationPreferences: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

const renderWithAuthContext = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithAuthContext(
      <Login 
        onRegister={() => {}} 
        onForgotPassword={() => {}} 
      />
    );

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('handles mobile number input correctly', async () => {
    const user = userEvent.setup();
    
    renderWithAuthContext(
      <Login 
        onRegister={() => {}} 
        onForgotPassword={() => {}} 
      />
    );

    const mobileInput = screen.getByLabelText('Mobile Number');
    await user.type(mobileInput, '1234567890');

    expect(mobileInput).toHaveValue('1234567890');
  });

  it('handles password input correctly', async () => {
    const user = userEvent.setup();
    
    renderWithAuthContext(
      <Login 
        onRegister={() => {}} 
        onForgotPassword={() => {}} 
      />
    );

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'testpassword');

    expect(passwordInput).toHaveValue('testpassword');
  });

  it('calls login function on form submission', async () => {
    const user = userEvent.setup();
    mockAuthContext.login.mockResolvedValue(true);
    
    renderWithAuthContext(
      <Login 
        onRegister={() => {}} 
        onForgotPassword={() => {}} 
      />
    );

    const mobileInput = screen.getByLabelText('Mobile Number');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(mobileInput, '1234567890');
    await user.type(passwordInput, 'testpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('+11234567890', 'testpassword');
    });
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    
    renderWithAuthContext(
      <Login 
        onRegister={() => {}} 
        onForgotPassword={() => {}} 
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Mobile number is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('calls onRegisterClick when register link is clicked', async () => {
    const onRegisterClick = jest.fn();
    const user = userEvent.setup();
    
    renderWithAuthContext(
      <Login 
        onRegister={onRegisterClick} 
        onForgotPassword={() => {}} 
      />
    );

    const registerLink = screen.getByText("Don't have an account? Register");
    await user.click(registerLink);

    expect(onRegisterClick).toHaveBeenCalled();
  });

  it('calls onForgotPasswordClick when forgot password link is clicked', async () => {
    const onForgotPasswordClick = jest.fn();
    const user = userEvent.setup();
    
    renderWithAuthContext(
      <Login 
        onRegister={() => {}} 
        onForgotPassword={onForgotPasswordClick} 
      />
    );

    const forgotPasswordLink = screen.getByText('Forgot your password?');
    await user.click(forgotPasswordLink);

    expect(onForgotPasswordClick).toHaveBeenCalled();
  });
});