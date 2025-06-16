
import { useState, useEffect, useCallback } from 'react';

export const useKeyboardControls = (
  currentContent: string[],
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  wordLength: number,
  onContentChange: () => void
) => {
  const [caseMode, setCaseMode] = useState<'lowercase' | 'uppercase'>('lowercase');

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // Toggle case mode with Shift key
    if (key === 'shift') {
      event.preventDefault();
      setCaseMode(prev => prev === 'lowercase' ? 'uppercase' : 'lowercase');
      return;
    }

    // Only respond to letter keys (a-z)
    if (!key.match(/^[a-z]$/)) {
      return;
    }

    // For single letters mode, jump directly to the letter
    if (wordLength === 1) {
      const letterIndex = key.charCodeAt(0) - 97; // 'a' = 97
      if (letterIndex !== currentIndex) {
        setCurrentIndex(letterIndex);
        onContentChange();
      }
    } else {
      // For word modes, navigate with arrow keys or spacebar
      if (key === 'arrowright' || key === ' ') {
        event.preventDefault();
        const newIndex = (currentIndex + 1) % currentContent.length;
        setCurrentIndex(newIndex);
        onContentChange();
      } else if (key === 'arrowleft') {
        event.preventDefault();
        const newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
        setCurrentIndex(newIndex);
        onContentChange();
      }
    }
  }, [currentContent.length, currentIndex, setCurrentIndex, wordLength, onContentChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { caseMode };
};
