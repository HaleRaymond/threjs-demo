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
  
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const updateKeyboardState = useCallback((height: number) => {
    console.log('Setting keyboard height:', height);
    const isOpening = height > 100;
    setKeyboardHeight(height);
    setIsKeyboardOpen(isOpening);
  }, []);

  // SIMPLE APPROACH: Use fixed keyboard heights for iOS
  const handleFocus = useCallback(() => {
    console.log('Input focused');
    
    if (isIOS) {
      // Use known iOS keyboard heights
      const isLandscape = window.innerWidth > window.innerHeight;
      const estimatedHeight = isLandscape ? 200 : 336;
      
      setTimeout(() => {
        updateKeyboardState(estimatedHeight);
      }, 100);
    } else {
      // Estimate for Android/other
      setTimeout(() => {
        updateKeyboardState(300);
      }, 100);
    }
  }, [isIOS, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    console.log('Input blurred');
    
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isTextInput = activeElement?.tagName === 'TEXTAREA' || 
                         activeElement?.tagName === 'INPUT';
      
      if (!isTextInput) {
        updateKeyboardState(0);
      }
    }, 150);
  }, [updateKeyboardState]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};
