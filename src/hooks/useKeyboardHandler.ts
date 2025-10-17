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
    console.log('Keyboard state:', height);
    const isOpening = height > 100;
    setKeyboardHeight(height);
    setIsKeyboardOpen(isOpening);
  }, []);

  // SIMPLE FOCUS/BLUR HANDLERS
  const handleFocus = useCallback(() => {
    console.log('Input focused - opening keyboard');
    
    // Immediately set keyboard state for iOS
    if (isIOS) {
      const isLandscape = window.innerWidth > window.innerHeight;
      const estimatedHeight = isLandscape ? 200 : 336;
      updateKeyboardState(estimatedHeight);
    } else {
      updateKeyboardState(300);
    }
  }, [isIOS, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    console.log('Input blurred - closing keyboard');
    
    // Close keyboard after delay
    setTimeout(() => {
      updateKeyboardState(0);
    }, 100);
  }, [updateKeyboardState]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};
