import { useEffect, useState, useCallback, useRef } from 'react';

interface KeyboardState {
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  onInputFocus: () => void;
  onInputBlur: () => void;
}

export const useKeyboardHandler = (): KeyboardState => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const focusTimeRef = useRef<number>(0);
  const originalViewportHeight = useRef<number>(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // iOS detection
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const updateKeyboardState = useCallback((height: number) => {
    console.log('Keyboard height update:', height);
    const isOpening = height > 100;
    setKeyboardHeight(height);
    setIsKeyboardOpen(isOpening);
    
    // Update iOS class for CSS control
    if (isIOS) {
      if (isOpening) {
        document.documentElement.classList.add('ios-keyboard-open');
      } else {
        document.documentElement.classList.remove('ios-keyboard-open');
      }
    }
  }, [isIOS]);

  // MAIN FIX: Visual Viewport API for iOS
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    originalViewportHeight.current = window.visualViewport.height;

    const handleVisualViewportChange = () => {
      if (!window.visualViewport) return;

      const visualViewport = window.visualViewport;
      const viewportHeight = visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // Calculate keyboard height
      const keyboardHeight = windowHeight - viewportHeight;
      
      console.log('Visual viewport change:', {
        viewportHeight,
        windowHeight,
        keyboardHeight,
        scale: visualViewport.scale
      });

      // iOS keyboard detection
      if (keyboardHeight > 100 && keyboardHeight < 400) {
        // Keyboard is open
        updateKeyboardState(keyboardHeight);
      } else if (keyboardHeight <= 50) {
        // Keyboard is closed
        updateKeyboardState(0);
      }
    };

    // Visual Viewport events
    window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    window.visualViewport.addEventListener('scroll', handleVisualViewportChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportChange);
    };
  }, [updateKeyboardState]);

  // Fallback for non-visualViewport browsers
  useEffect(() => {
    if (typeof window === 'undefined' || window.visualViewport) return;

    let originalHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = originalHeight - currentHeight;

      console.log('Resize handler:', { currentHeight, originalHeight, heightDiff });

      if (heightDiff > 100 && heightDiff < 500) {
        // Keyboard opened
        updateKeyboardState(heightDiff);
        originalHeight = currentHeight;
      } else if (currentHeight > originalHeight && keyboardHeight > 0) {
        // Keyboard closed
        updateKeyboardState(0);
        originalHeight = currentHeight;
      } else if (Math.abs(heightDiff) < 50) {
        // Window resize, not keyboard
        originalHeight = currentHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [keyboardHeight, updateKeyboardState]);

  // Focus/blur handlers
  const handleFocus = useCallback(() => {
    focusTimeRef.current = Date.now();
    
    if (isIOS) {
      // For iOS, we rely on visualViewport, but trigger state change
      setTimeout(() => {
        if (keyboardHeight === 0) {
          // Estimate iOS keyboard height
          const isLandscape = window.innerWidth > window.innerHeight;
          const estimatedHeight = isLandscape ? 200 : 336;
          updateKeyboardState(estimatedHeight);
        }
      }, 300);
    }
  }, [isIOS, keyboardHeight, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    if (isIOS) {
      // Delay closing to prevent flicker
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isTextInput = activeElement?.tagName === 'TEXTAREA' || 
                           activeElement?.tagName === 'INPUT';
        
        if (!isTextInput) {
          updateKeyboardState(0);
        }
      }, 100);
    } else {
      updateKeyboardState(0);
    }
  }, [isIOS, updateKeyboardState]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};
