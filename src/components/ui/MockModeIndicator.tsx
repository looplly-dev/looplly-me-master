import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

/**
 * Visual indicator shown when mock authentication mode is active
 * Displays a prominent warning banner at the top of the user dashboard
 */
export function MockModeIndicator() {
  const [show, setShow] = useState(true);
  const authMode = typeof window !== 'undefined' ? localStorage.getItem('looplly_auth_mode') : null;
  
  if (authMode !== 'mock' || !show) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="font-semibold">⚠️ MOCK AUTHENTICATION MODE</span>
        <span className="text-sm opacity-90 hidden sm:inline">
          Development only - All users auto-login as test user
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShow(false)}
        className="text-white hover:bg-amber-600 h-8 w-8 p-0 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
