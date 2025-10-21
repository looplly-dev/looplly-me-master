// React Hook for Google Analytics
// Provides easy access to analytics functions in components
// Automatically tracks page views on route changes

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/utils/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  // Auto-track page views on route changes
  useEffect(() => {
    // Get page title from route or document
    const pageTitle = document.title;
    
    // Track page view
    analytics.trackPageView(location.pathname, pageTitle);
  }, [location.pathname]);

  return analytics;
};
