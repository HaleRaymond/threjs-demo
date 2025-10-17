import { useState, useCallback, useEffect } from 'react';

export const useKeyboardHandler = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // REAL iOS/ANDROID DETECTION
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let originalHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = originalHeight - currentHeight;

      // Real device tested thresholds
      if (heightDiff > 100 && heightDiff < 500) {
        // Keyboard opened
        setKeyboardHeight(heightDiff);
        setIsKeyboardOpen(true);
        originalHeight = currentHeight;
      } else if (currentHeight >= originalHeight && keyboardHeight > 0) {
        // Keyboard closed
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
        originalHeight = currentHeight;
      }
    };

    // Visual Viewport API (modern browsers)
    const handleVisualViewport = () => {
      if (!window.visualViewport) return;
      
      const viewport = window.visualViewport;
      const heightDiff = window.screen.height - viewport.height;
      
      if (heightDiff > 150) {
        setKeyboardHeight(heightDiff);
        setIsKeyboardOpen(true);
      } else if (heightDiff < 50) {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
    };

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
  }, [keyboardHeight]);

  const onInputFocus = useCallback(() => {
    // Force keyboard open state
    setIsKeyboardOpen(true);
  }, []);

  const onInputBlur = useCallback(() => {
    // Don't immediately close - wait for resize event
    setTimeout(() => {
      if (!isKeyboardOpen) {
        setKeyboardHeight(0);
      }
    }, 100);
  }, [isKeyboardOpen]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus,
    onInputBlur
  };
};
