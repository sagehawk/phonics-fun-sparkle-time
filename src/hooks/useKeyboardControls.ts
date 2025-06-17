
import { useState, useEffect, useCallback } from 'react';

export const useKeyboardControls = (
  currentContent: string[],
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  wordLength: number,
  onContentChange: () => void,
  onConfetti: () => void
) => {
  const [caseMode, setCaseMode] = useState<'lowercase' | 'uppercase'>('uppercase'); // Start with uppercase

  const toggleCaseMode = useCallback(() => {
    setCaseMode(prev => prev === 'lowercase' ? 'uppercase' : 'lowercase');
    // Don't play navigation sound for case toggle - it's a different action
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // Handle Enter key for confetti
    if (key === 'enter') {
      event.preventDefault();
      onConfetti();
      return;
    }

    // Toggle case mode with Shift key (for any word length)
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

    // Only respond to letter keys for single letter mode
    if (!key.match(/^[a-z]$/) || wordLength !== 1) {
      return;
    }

    // For single letters mode, jump directly to the letter
    const letterIndex = key.charCodeAt(0) - 97; // 'a' = 97
    if (letterIndex !== currentIndex) {
      setCurrentIndex(letterIndex);
      onContentChange();
    }
  }, [currentContent.length, currentIndex, setCurrentIndex, wordLength, onContentChange, toggleCaseMode, onConfetti]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { caseMode, toggleCaseMode };
};
