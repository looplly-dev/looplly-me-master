import { ReactNode } from 'react';
import { MockAuthProvider } from './JourneyPreviewMocks';
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
  // Import the mock auth context
  const mockAuth = require('./JourneyPreviewMocks').useMockAuth();
  
  return (
    <AuthContext.Provider value={mockAuth as any}>
      {children}
    </AuthContext.Provider>
  );
};
