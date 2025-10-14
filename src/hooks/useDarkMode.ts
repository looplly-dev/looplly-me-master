import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply/remove dark class
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      updateMetaThemeColor('#111418'); // Dark background
    } else {
      root.classList.remove('dark');
      updateMetaThemeColor('#ffffff'); // Light background
    }
    
    // Persist to localStorage
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set preference
      const hasManualPreference = localStorage.getItem('darkMode') !== null;
      if (!hasManualPreference) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
  };

  return { isDarkMode, toggleDarkMode, setDarkMode };
};

// Helper to update mobile browser theme color
function updateMetaThemeColor(color: string) {
  let metaTag = document.querySelector('meta[name="theme-color"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', color);
}
