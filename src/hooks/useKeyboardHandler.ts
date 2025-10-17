import { useState, useCallback, useEffect } from 'react';

export const useKeyboardHandler = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect platform
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    setPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'unknown');

    let originalHeight = window.innerHeight;

    // Universal resize handler
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = originalHeight - currentHeight;

      // Platform-specific keyboard detection
      if (isIOS) {
        // iOS: Use consistent heights for smooth animation
        if (heightDiff > 100) {
          const isLandscape = window.innerWidth > window.innerHeight;
          const estimatedHeight = isLandscape ? 200 : 336;
          setKeyboardHeight(estimatedHeight);
          setIsKeyboardOpen(true);
        } else if (currentHeight >= originalHeight) {
          setKeyboardHeight(0);
          setIsKeyboardOpen(false);
        }
      } else if (isAndroid) {
        // Android: More sensitive detection
        if (heightDiff > 50 && heightDiff < 500) {
          setKeyboardHeight(heightDiff);
          setIsKeyboardOpen(true);
        } else if (heightDiff <= 50) {
          setKeyboardHeight(0);
          setIsKeyboardOpen(false);
        }
      } else {
        // Fallback for other browsers
        if (heightDiff > 100) {
          setKeyboardHeight(300);
          setIsKeyboardOpen(true);
        } else {
          setKeyboardHeight(0);
          setIsKeyboardOpen(false);
        }
      }
      
      originalHeight = currentHeight;
    };

    // Visual Viewport API (better for iOS Safari)
    const handleVisualViewport = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport;
        const heightDiff = window.innerHeight - viewport.height;
        
        if (heightDiff > 150) {
          setKeyboardHeight(heightDiff);
          setIsKeyboardOpen(true);
        } else if (heightDiff < 50) {
          setKeyboardHeight(0);
          setIsKeyboardOpen(false);
        }
      }
    };

    // Add appropriate event listeners
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
    };
  }, []);

  const onInputFocus = useCallback(() => {
    setIsKeyboardOpen(true);
  }, []);

  const onInputBlur = useCallback(() => {
    setTimeout(() => {
      setIsKeyboardOpen(false);
      setKeyboardHeight(0);
    }, 100);
  }, []);

  return {
    keyboardHeight,
    isKeyboardOpen,
    platform,
    onInputFocus,
    onInputBlur
  };
};
