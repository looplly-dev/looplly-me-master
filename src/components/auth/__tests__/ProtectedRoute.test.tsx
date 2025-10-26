import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

// Mock hooks
const mockNavigate = jest.fn();
const mockToast = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockUseAuth = jest.fn();
const mockUseRole = jest.fn();
const mockUseUserType = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/useRole', () => ({
  useRole: () => mockUseRole(),
}));

jest.mock('@/hooks/useUserType', () => ({
  useUserType: () => mockUseUserType(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderProtectedRoute = (requiredRole?: any) => {
    return render(
      <BrowserRouter>
        <ProtectedRoute requiredRole={requiredRole}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
  };

  describe('Admin Gate - Team Members Only', () => {
    it('should show "Team Members Only" for non-team users accessing admin route', async () => {
      mockUseAuth.mockReturnValue({
        authState: {
          user: { id: 'user-1', profile: {} },
          isAuthenticated: true,
          isLoading: false,
        },
      });

      mockUseRole.mockReturnValue({
        hasRole: jest.fn(() => false),
        isLoading: false,
        isAdmin: jest.fn(() => false),
        isSuperAdmin: jest.fn(() => false),
      });

      mockUseUserType.mockReturnValue({
        userType: 'looplly_user',
        isLoading: false,
      });

      renderProtectedRoute('admin');

      await waitFor(() => {
        expect(screen.getByText('Team Members Only')).toBeInTheDocument();
        expect(
          screen.getByText(/The admin portal is restricted to Looplly team members/)
        ).toBeInTheDocument();
      });
    });

    it('should show "Insufficient Permissions" for team members without admin role', async () => {
      mockUseAuth.mockReturnValue({
        authState: {
          user: { id: 'user-1', profile: {} },
          isAuthenticated: true,
          isLoading: false,
        },
      });

      mockUseRole.mockReturnValue({
        hasRole: jest.fn(() => false),
        isLoading: false,
        isAdmin: jest.fn(() => false),
        isSuperAdmin: jest.fn(() => false),
      });

      mockUseUserType.mockReturnValue({
        userType: 'looplly_team_user',
        isLoading: false,
      });

      renderProtectedRoute('admin');

      await waitFor(() => {
        expect(screen.getByText('Insufficient Permissions')).toBeInTheDocument();
        expect(
          screen.getByText(/You don't have permission to access this admin area/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Required role:/)).toBeInTheDocument();
      });
    });

    it('should allow team members with admin role', async () => {
      mockUseAuth.mockReturnValue({
        authState: {
          user: { id: 'user-1', profile: {} },
          isAuthenticated: true,
          isLoading: false,
        },
      });

      mockUseRole.mockReturnValue({
        hasRole: jest.fn(() => true),
        isLoading: false,
        isAdmin: jest.fn(() => true),
        isSuperAdmin: jest.fn(() => false),
      });

      mockUseUserType.mockReturnValue({
        userType: 'looplly_team_user',
        isLoading: false,
      });

      renderProtectedRoute('admin');

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should allow team members with super_admin role', async () => {
      mockUseAuth.mockReturnValue({
        authState: {
          user: { id: 'user-1', profile: {} },
          isAuthenticated: true,
          isLoading: false,
        },
      });

      mockUseRole.mockReturnValue({
        hasRole: jest.fn(() => true),
        isLoading: false,
        isAdmin: jest.fn(() => true),
        isSuperAdmin: jest.fn(() => true),
      });

      mockUseUserType.mockReturnValue({
        userType: 'looplly_team_user',
        isLoading: false,
      });

      renderProtectedRoute('super_admin');

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Regular protected routes', () => {
    it('should show authentication required when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        },
      });

      mockUseRole.mockReturnValue({
        hasRole: jest.fn(() => false),
        isLoading: false,
        isAdmin: jest.fn(() => false),
        isSuperAdmin: jest.fn(() => false),
      });

      mockUseUserType.mockReturnValue({
        userType: null,
        isLoading: false,
      });

      renderProtectedRoute('user');

      await waitFor(() => {
        expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      });
    });

    it('should show content for authenticated users with sufficient role', async () => {
      mockUseAuth.mockReturnValue({
        authState: {
          user: { id: 'user-1', profile: {} },
          isAuthenticated: true,
          isLoading: false,
        },
      });

      mockUseRole.mockReturnValue({
        hasRole: jest.fn(() => true),
        isLoading: false,
        isAdmin: jest.fn(() => false),
        isSuperAdmin: jest.fn(() => false),
      });

      mockUseUserType.mockReturnValue({
        userType: 'looplly_user',
        isLoading: false,
      });

      renderProtectedRoute('user');

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading spinner while authenticating', () => {
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          isAuthenticated: false,
          isLoading: true,
        },
      });

      mockUseRole.mockReturnValue({
        hasRole: jest.fn(() => false),
        isLoading: false,
        isAdmin: jest.fn(() => false),
        isSuperAdmin: jest.fn(() => false),
      });

      mockUseUserType.mockReturnValue({
        userType: null,
        isLoading: false,
      });

      renderProtectedRoute('user');

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });
});
