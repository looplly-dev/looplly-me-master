// Runtime Environment Detection
// Helps distinguish between local dev, Lovable Preview, and production

/**
 * Detects if running in Lovable Preview environment
 * Preview runs in iframe and on *.lovableproject.com domains
 */
export const isPreview = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if running in iframe (Lovable Preview)
  const inIframe = window.self !== window.top;
  
  // Check if on lovableproject.com domain
  const onLovableDomain = window.location.hostname.endsWith('.lovableproject.com');
  
  return inIframe || onLovableDomain;
};

/**
 * Detects if running in production
 */
export const isProd = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * Detects if running in development (but not Preview)
 */
export const isDev = (): boolean => {
  return import.meta.env.DEV && !isPreview();
};
