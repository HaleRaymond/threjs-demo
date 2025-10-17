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

  // Platform detection
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const isAndroid = typeof window !== 'undefined' && /Android/.test(navigator.userAgent);

  const updateKeyboardState = useCallback((height: number) => {
    const isOpening = height > 100;
    setKeyboardHeight(height);
    setIsKeyboardOpen(isOpening);
  }, []);

  // Main resize handler - works for both iOS and Android
  useEffect(() => {
    if (typeof window === 'undefined') return;

    originalHeightRef.current = window.innerHeight;

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDiff = originalHeightRef.current - currentHeight;

        // Keyboard detection logic
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
      }, isIOS ? 150 : 100);
    };

    // Visual Viewport API for modern browsers
    const handleVisualViewport = () => {
      if (!window.visualViewport) return;
      
      const visualViewport = window.visualViewport;
      const heightDiff = window.innerHeight - visualViewport.height;
      
      if (heightDiff > 100) {
        updateKeyboardState(heightDiff);
      } else if (heightDiff < 50 && keyboardHeight > 0) {
        updateKeyboardState(0);
      }
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [keyboardHeight, updateKeyboardState, isIOS]);

  // Focus/blur handlers
  const handleFocus = useCallback(() => {
    focusTimeRef.current = Date.now();
    
    const delay = isIOS ? 400 : isAndroid ? 200 : 150;
    
    setTimeout(() => {
      if (keyboardHeight === 0) {
        const estimatedHeight = isIOS ? 336 : isAndroid ? 280 : 300;
        updateKeyboardState(estimatedHeight);
      }
    }, delay);
  }, [isIOS, isAndroid, keyboardHeight, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    const delay = isIOS ? 200 : 100;
    
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isTextInput = activeElement?.tagName === 'TEXTAREA' || 
                         activeElement?.tagName === 'INPUT';
      
      if (!isTextInput) {
        updateKeyboardState(0);
      }
    }, delay);
  }, [isIOS, updateKeyboardState]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};
