import { useState, useCallback, useEffect } from 'react';

export const useKeyboardHandler = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    let originalHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = originalHeight - currentHeight;

      // Better keyboard detection
      if (heightDiff > 100) {
        // Keyboard opened
        const estimatedHeight = isIOS ? 336 : 300;
        setKeyboardHeight(estimatedHeight);
        setIsKeyboardOpen(true);
      } else if (currentHeight >= originalHeight) {
        // Keyboard closed
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
      
      originalHeight = currentHeight;
    };

    // Use visual viewport if available (more accurate)
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
    }, 150);
  }, []);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus,
    onInputBlur
  };
};
