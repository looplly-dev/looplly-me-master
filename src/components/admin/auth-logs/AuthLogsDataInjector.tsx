import { useEffect } from 'react';

interface AuthLogsDataInjectorProps {
  authLogs: any[];
  edgeFunctionLogs: any[];
}

/**
 * Component to inject auth logs and edge function logs into global scope
 * for consumption by useAuthLogs hook
 */
export function AuthLogsDataInjector({ authLogs, edgeFunctionLogs }: AuthLogsDataInjectorProps) {
  useEffect(() => {
    (window as any).__AUTH_LOGS__ = authLogs;
    (window as any).__EDGE_FUNCTION_LOGS__ = edgeFunctionLogs;
    
    return () => {
      delete (window as any).__AUTH_LOGS__;
      delete (window as any).__EDGE_FUNCTION_LOGS__;
    };
  }, [authLogs, edgeFunctionLogs]);

  return null;
}
