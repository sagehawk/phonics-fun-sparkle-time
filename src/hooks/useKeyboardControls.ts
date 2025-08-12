import { useState, useEffect, useCallback } from 'react';

export const useKeyboardControls = (
  words: string[],
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  wordLength: number,
  setWordLength: (length: number) => void,
  onNewWord: () => void,
  onConfetti: () => void,
  findRhymeGroup: (word: string) => void,
  getNextRhyme: () => string | undefined,
) => {
  const [caseMode, setCaseMode] = useState<'uppercase' | 'lowercase'>('uppercase');

  const toggleCaseMode = useCallback(() => {
    setCaseMode(prev => prev === 'lowercase' ? 'uppercase' : 'lowercase');
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    if (['1', '2', '3', '4'].includes(key)) {
        setWordLength(Number(key));
        return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      onConfetti();
      return;
    }

    if (event.key === 'Shift') {
      event.preventDefault();
      toggleCaseMode();
      return;
    }

    // Arrow key navigation
    if (key === 'arrowright') {
      event.preventDefault();
      if (words.length > 0) {
        const newIndex = (currentIndex + 1) % words.length;
        setCurrentIndex(newIndex);
        onNewWord();
      }
      return;
    }

    if (key === 'arrowleft') {
      event.preventDefault();
      if (words.length > 0) {
        const newIndex = (currentIndex - 1 + words.length) % words.length;
        setCurrentIndex(newIndex);
        onNewWord();
      }
      return;
    }

    if (key === 'arrowup' || key === 'arrowdown') {
      event.preventDefault();
      const nextRhyme = getNextRhyme();
      if (nextRhyme) {
        const nextIndex = words.indexOf(nextRhyme);
        if (nextIndex !== -1) {
          setCurrentIndex(nextIndex);
        }
      }
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
      onNewWord();
    }
  }, [words, currentIndex, setCurrentIndex, wordLength, setWordLength, onNewWord, onConfetti, findRhymeGroup, getNextRhyme, toggleCaseMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { caseMode, toggleCaseMode };
};
