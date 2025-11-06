import { ReactNode, useEffect } from 'react';
import { AuthContext, useAuthLogic } from '@/hooks/useAuth';
import { useMockAuth } from '@/hooks/useMockAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Check localStorage for auth mode (set by admin in AdminDashboard)
  const authMode = typeof window !== 'undefined' ? localStorage.getItem('looplly_auth_mode') : null;
  
  // Use mock or real auth hook based on mode
  const authLogic = authMode === 'mock' ? useMockAuth() : useAuthLogic();
  
  // Listen for storage changes to reload when mode changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'looplly_auth_mode') {
        console.info('[AuthProvider] Auth mode changed, reloading...');
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={authLogic}>
      {children}
    </AuthContext.Provider>
  );
}