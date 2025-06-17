
import { useState, useEffect, useCallback } from 'react';

export const useKeyboardControls = (
  currentContent: string[],
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  wordLength: number,
  onContentChange: () => void,
  onConfetti: () => void
) => {
  const [caseMode, setCaseMode] = useState<'lowercase' | 'uppercase'>('lowercase');

  const toggleCaseMode = useCallback(() => {
    setCaseMode(prev => prev === 'lowercase' ? 'uppercase' : 'lowercase');
    onContentChange();
  }, [onContentChange]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // Handle Enter key for confetti
    if (key === 'enter') {
      event.preventDefault();
      onConfetti();
      return;
    }

    // Toggle case mode with Shift key
    if (key === 'shift') {
      event.preventDefault();
      toggleCaseMode();
      return;
    }

    // Arrow key navigation
    if (key === 'arrowright') {
      event.preventDefault();
      const newIndex = (currentIndex + 1) % currentContent.length;
      setCurrentIndex(newIndex);
      onContentChange();
      return;
    }

    if (key === 'arrowleft') {
      event.preventDefault();
      const newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
      setCurrentIndex(newIndex);
      onContentChange();
      return;
    }

    // Only respond to letter keys
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
    }
  }, [currentContent.length, currentIndex, setCurrentIndex, wordLength, onContentChange, toggleCaseMode, onConfetti]);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    // This will be handled by the LetterDisplay component
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleKeyDown, handleWheel]);

  return { caseMode, toggleCaseMode };
};
