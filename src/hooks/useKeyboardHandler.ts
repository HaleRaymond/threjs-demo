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
  const originalHeightRef = useRef<number>(0);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Better iOS detection including iOS Chrome
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
     (/CriOS/.test(navigator.userAgent))); // iOS Chrome

  const isAndroid = typeof window !== 'undefined' && /Android/.test(navigator.userAgent);

  const updateKeyboardState = useCallback((height: number) => {
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

  // iOS-specific keyboard handlers
  useEffect(() => {
    if (!isIOS) return;

    const handleFocus = () => {
      document.documentElement.classList.add('ios-keyboard-open');
    };

    const handleBlur = () => {
      // Delay removal to prevent flicker
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isTextInput = activeElement?.tagName === 'TEXTAREA' || 
                           activeElement?.tagName === 'INPUT';
        
        if (!isTextInput) {
          document.documentElement.classList.remove('ios-keyboard-open');
        }
      }, 100);
    };

    // Add event listeners for all inputs
    const inputs = document.querySelectorAll('textarea, input');
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
      document.documentElement.classList.remove('ios-keyboard-open');
    };
  }, [isIOS]);

  // Main resize handler - optimized for iOS
  useEffect(() => {
    if (typeof window === 'undefined') return;

    originalHeightRef.current = window.innerHeight;

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const visualHeight = window.visualViewport?.height || currentHeight;
        const heightDiff = originalHeightRef.current - currentHeight;

        // iOS-specific detection using multiple methods
        if (isIOS) {
          const screenHeight = window.screen.height;
          const visualDiff = screenHeight - visualHeight;
          
          // More accurate iOS keyboard detection
          if (visualDiff > 200 && visualDiff < 400) {
            // Keyboard is definitely open
            updateKeyboardState(visualDiff);
            originalHeightRef.current = currentHeight;
          } else if (visualDiff < 50 && keyboardHeight > 0) {
            // Keyboard closed
            updateKeyboardState(0);
            originalHeightRef.current = currentHeight;
          }
          return;
        }

        // Original logic for Android/other devices
        const isLikelyKeyboard = heightDiff > 100 && 
                                heightDiff < originalHeightRef.current * 0.7;

        if (isLikelyKeyboard) {
          // Keyboard opened
          updateKeyboardState(heightDiff);
          originalHeightRef.current = currentHeight;
        } else if (currentHeight > originalHeightRef.current && keyboardHeight > 0) {
          // Keyboard closed
          updateKeyboardState(0);
          originalHeightRef.current = currentHeight;
        } else {
          // Actual window resize
          originalHeightRef.current = currentHeight;
        }
      }, isIOS ? 100 : 50); // Faster response for iOS
    };

    // Visual Viewport API for modern browsers (better for iOS)
    const handleVisualViewport = () => {
      if (!window.visualViewport) return;
      
      const visualViewport = window.visualViewport;
      const heightDiff = window.innerHeight - visualViewport.height;
      
      // More sensitive detection for iOS
      const threshold = isIOS ? 150 : 100;
      
      if (heightDiff > threshold) {
        updateKeyboardState(heightDiff);
      } else if (heightDiff < 50 && keyboardHeight > 0) {
        updateKeyboardState(0);
      }
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
      window.visualViewport.addEventListener('scroll', handleVisualViewport);
    }

    // Initial measurement
    originalHeightRef.current = window.innerHeight;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
        window.visualViewport.removeEventListener('scroll', handleVisualViewport);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (keyboardCloseTimeoutRef.current) {
        clearTimeout(keyboardCloseTimeoutRef.current);
      }
    };
  }, [keyboardHeight, updateKeyboardState, isIOS]);

  // Focus/blur handlers with iOS optimizations
  const handleFocus = useCallback(() => {
    focusTimeRef.current = Date.now();
    
    // Different delays for different platforms
    const delay = isIOS ? 350 : isAndroid ? 200 : 150;
    
    setTimeout(() => {
      if (keyboardHeight === 0) {
        // Estimate keyboard height based on platform
        const estimatedHeight = isIOS ? 336 : isAndroid ? 280 : 300;
        updateKeyboardState(estimatedHeight);
      }
    }, delay);
  }, [isIOS, isAndroid, keyboardHeight, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    const delay = isIOS ? 200 : 100;
    
    // Clear any existing timeout
    if (keyboardCloseTimeoutRef.current) {
      clearTimeout(keyboardCloseTimeoutRef.current);
    }
    
    keyboardCloseTimeoutRef.current = setTimeout(() => {
      const activeElement = document.activeElement;
      const isTextInput = activeElement?.tagName === 'TEXTAREA' || 
                         activeElement?.tagName === 'INPUT';
      
      if (!isTextInput) {
        updateKeyboardState(0);
      }
    }, delay);
  }, [isIOS, updateKeyboardState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (keyboardCloseTimeoutRef.current) {
        clearTimeout(keyboardCloseTimeoutRef.current);
      }
      if (isIOS) {
        document.documentElement.classList.remove('ios-keyboard-open');
      }
    };
  }, [isIOS]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};
