import { useState, useCallback, useEffect } from 'react';

export const useKeyboardHandler = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Realistic keyboard detection
  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (!visualViewport) return;

      const heightDiff = window.screen.height - visualViewport.height;
      
      if (heightDiff > 200) {
        setKeyboardHeight(heightDiff);
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
    // Delay to allow for form submission
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
