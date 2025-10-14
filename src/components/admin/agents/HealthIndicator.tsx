import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthIndicatorProps {
  successRate: number;
}

export function HealthIndicator({ successRate }: HealthIndicatorProps) {
  if (successRate >= 95) {
    return <CheckCircle className="w-3 h-3 text-green-500" />;
  }
  if (successRate >= 80) {
    return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
  }
  return <AlertCircle className="w-3 h-3 text-red-500" />;
}
