import { useState, useCallback, useEffect } from 'react';

export const useKeyboardHandler = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (!visualViewport) return;

      const keyboardHeight = window.innerHeight - visualViewport.height;
      
      if (keyboardHeight > 100) {
        setKeyboardHeight(keyboardHeight);
        setIsKeyboardOpen(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const onInputFocus = useCallback(() => {
    setIsKeyboardOpen(true);
  }, []);

  const onInputBlur = useCallback(() => {
    setTimeout(() => setIsKeyboardOpen(false), 100);
  }, []);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus,
    onInputBlur
  };
};
