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

  const updateKeyboardState = useCallback((height: number) => {
    const isOpening = height > 100;
    setKeyboardHeight(height);
    setIsKeyboardOpen(isOpening);
  }, []);

  // Simple resize handler
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

        if (heightDiff > 100 && heightDiff < 500) {
          updateKeyboardState(heightDiff);
        } else if (currentHeight > originalHeightRef.current && keyboardHeight > 0) {
          updateKeyboardState(0);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [keyboardHeight, updateKeyboardState]);

  const handleFocus = useCallback(() => {
    focusTimeRef.current = Date.now();
    setTimeout(() => {
      if (keyboardHeight === 0) {
        updateKeyboardState(300);
      }
    }, 300);
  }, [keyboardHeight, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isTextInput = activeElement?.tagName === 'TEXTAREA' || 
                         activeElement?.tagName === 'INPUT';
      
      if (!isTextInput) {
        updateKeyboardState(0);
      }
    }, 100);
  }, [updateKeyboardState]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};
