import { useEffect, useState, useCallback, useRef } from 'react';

// Hook for measuring Core Web Vitals
export const useWebVitals = () => {
  const [vitals, setVitals] = useState<{
    lcp?: number;
    inp?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  }>({});

  useEffect(() => {
    // Dynamically import web-vitals to avoid blocking
    const loadWebVitals = async () => {
      try {
        const webVitals = await import('web-vitals');
        
        webVitals.onLCP((metric) => {
          setVitals(prev => ({ ...prev, lcp: metric.value }));
        });
        
        webVitals.onINP((metric) => {
          setVitals(prev => ({ ...prev, inp: metric.value }));
        });
        
        webVitals.onCLS((metric) => {
          setVitals(prev => ({ ...prev, cls: metric.value }));
        });
        
        webVitals.onFCP((metric) => {
          setVitals(prev => ({ ...prev, fcp: metric.value }));
        });
        
        webVitals.onTTFB((metric) => {
          setVitals(prev => ({ ...prev, ttfb: metric.value }));
        });
      } catch (error) {
        console.warn('Failed to load web-vitals:', error);
      }
    };

    loadWebVitals();
  }, []);

  return vitals;
};

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

// Hook for preloading resources
export const usePreload = () => {
  const preloadImage = useCallback((src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const preloadScript = useCallback((src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const prefetchPage = useCallback((href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  return { preloadImage, preloadScript, prefetchPage };
};

// Hook for performance monitoring and optimization
export const usePerformanceOptimization = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [deviceMemory, setDeviceMemory] = useState<number>();

  useEffect(() => {
    // Check network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateConnectionInfo = () => {
          setIsSlowConnection(
            connection.effectiveType === '2g' || 
            connection.effectiveType === 'slow-2g' ||
            connection.saveData
          );
        };
        
        updateConnectionInfo();
        connection.addEventListener('change', updateConnectionInfo);
        
        return () => {
          connection.removeEventListener('change', updateConnectionInfo);
        };
      }
    }

    // Check device memory
    if ('deviceMemory' in navigator) {
      setDeviceMemory((navigator as any).deviceMemory);
    }
  }, []);

  const shouldReduceAnimations = deviceMemory && deviceMemory < 4;
  const shouldLazyLoad = isSlowConnection || (deviceMemory && deviceMemory < 2);

  return {
    isSlowConnection,
    deviceMemory,
    shouldReduceAnimations,
    shouldLazyLoad
  };
};

// Utility for optimized image loading
export const useOptimizedImage = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    lazy?: boolean;
  } = {}
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { shouldLazyLoad } = usePerformanceOptimization();
  
  const { hasIntersected, targetRef } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  const shouldLoad = !options.lazy || !shouldLazyLoad || hasIntersected;

  useEffect(() => {
    if (!shouldLoad) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setError(null);
    };
    
    img.onerror = (e) => {
      setError(new Error('Failed to load image'));
      setIsLoaded(false);
    };

    // Generate optimized src based on options
    let optimizedSrc = src;
    if (options.width || options.height) {
      // This would integrate with your image optimization service
      const params = new URLSearchParams();
      if (options.width) params.set('w', options.width.toString());
      if (options.height) params.set('h', options.height.toString());
      if (options.quality) params.set('q', options.quality.toString());
      if (options.format && options.format !== 'auto') params.set('f', options.format);
      
      optimizedSrc = `${src}?${params.toString()}`;
    }

    img.src = optimizedSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, shouldLoad, options]);

  return {
    imgRef: targetRef,
    isLoaded,
    error,
    shouldLoad
  };
};