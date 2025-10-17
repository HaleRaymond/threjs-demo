import { useState, useCallback, useEffect } from 'react';

export const useKeyboardHandler = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let originalHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = originalHeight - currentHeight;

      if (heightDiff > 100 && heightDiff < 500) {
        // Keyboard opened
        setKeyboardHeight(heightDiff);
        setIsKeyboardOpen(true);
        originalHeight = currentHeight;
      } else if (currentHeight > originalHeight) {
        // Keyboard closed
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
        originalHeight = currentHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
    onInputFocus,
    onInputBlur
  };
};
