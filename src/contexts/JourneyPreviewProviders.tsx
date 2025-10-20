import { ReactNode } from 'react';
import { MockAuthProvider, useMockAuth } from './JourneyPreviewMocks';
import { AuthContext } from '@/hooks/useAuth';

// This provider wraps components in preview mode and overrides the real auth context
export const JourneyPreviewProviders = ({ children }: { children: ReactNode }) => {
  return (
    <MockAuthProvider>
      <AuthContextOverride>
        {children}
      </AuthContextOverride>
    </MockAuthProvider>
  );
};

// Component that injects mock auth into the real AuthContext
const AuthContextOverride = ({ children }: { children: ReactNode }) => {
  const mockAuth = useMockAuth();
  
  return (
    <AuthContext.Provider value={mockAuth}>
      {children}
    </AuthContext.Provider>
  );
};
