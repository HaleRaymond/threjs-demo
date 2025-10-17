import { useEffect, useState, useCallback } from 'react';

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
    const isOpening = height > 100;
    setKeyboardHeight(height);
    setIsKeyboardOpen(isOpening);

    if (isIOS) {
      if (isOpening) {
        document.documentElement.classList.add('ios-keyboard-open');
      } else {
        document.documentElement.classList.remove('ios-keyboard-open');
      }
    }
  }, [isIOS]);

  const handleFocus = useCallback(() => {
    if (isIOS) {
      const isLandscape = window.innerWidth > window.innerHeight;
      const estimatedHeight = isLandscape ? 200 : 336;
      setTimeout(() => updateKeyboardState(estimatedHeight), 100);
    } else {
      setTimeout(() => updateKeyboardState(300), 100);
    }
  }, [isIOS, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      const active = document.activeElement;
      const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';
      if (!isInput) updateKeyboardState(0);
    }, 150);
  }, [updateKeyboardState]);

  useEffect(() => {
    const lockResize = () => {
      if (isIOS && isKeyboardOpen) {
        window.scrollTo(0, 0);
        document.body.style.height = '100dvh';
        document.body.style.overflow = 'hidden';
      }
    };
    window.addEventListener('resize', lockResize);
    return () => window.removeEventListener('resize', lockResize);
  }, [isIOS, isKeyboardOpen]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};

