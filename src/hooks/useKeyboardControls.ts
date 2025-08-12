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
  rhymeGroups: { [key: string]: string[] } | null,
) => {
  const [caseMode, setCaseMode] = useState<'uppercase' | 'lowercase'>('uppercase');

  const toggleCaseMode = useCallback(() => {
    setCaseMode(prev => prev === 'lowercase' ? 'uppercase' : 'lowercase');
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // Helper for simple sequential navigation
    const navigate = (direction: 'next' | 'prev') => {
      if (words.length === 0) return;
      const newIndex = direction === 'next'
        ? (currentIndex + 1) % words.length
        : (currentIndex - 1 + words.length) % words.length;
      setCurrentIndex(newIndex);
      onNewWord();
    };

    if (['0', '1', '2', '3', '4'].includes(key)) {
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

    // --- Arrow Key Navigation Logic ---

    if (wordLength === 0) {
      if (key === 'arrowright' || key === 'arrowdown') navigate('next');
      if (key === 'arrowleft' || key === 'arrowup') navigate('prev');
      return;
    }

    if (wordLength === 1) {
      // For single letters mode, arrow keys navigate sequentially
      if (key === 'arrowup' || key === 'arrowright') navigate('next');
      if (key === 'arrowdown' || key === 'arrowleft') navigate('prev');
      
      // Also allow jumping directly to a letter
      if (key.match(/^[a-z]$/)) {
        const letterIndex = key.charCodeAt(0) - 97; // 'a' = 97
        if (letterIndex !== currentIndex) {
          setCurrentIndex(letterIndex);
          onNewWord();
        }
      }
      return;
    }

    // This block handles 2, 3, 4-letter words and beyond, ensuring their behavior is identical.
    if (wordLength >= 2) {
      event.preventDefault();

      // Horizontal navigation (Left/Right Arrows)
      if (key === 'arrowright' || key === 'arrowleft') {
        if (rhymeGroups) {
          const currentWord = words[currentIndex];
          const currentRhymeGroup = Object.values(rhymeGroups).find(group => group.includes(currentWord.toUpperCase()));
          let newIndex = currentIndex;

          if (key === 'arrowright') {
            do {
              newIndex = (newIndex + 1) % words.length;
            } while (currentRhymeGroup && currentRhymeGroup.includes(words[newIndex].toUpperCase()) && newIndex !== currentIndex);
          } else { // arrowleft
            do {
              newIndex = (newIndex - 1 + words.length) % words.length;
            } while (currentRhymeGroup && currentRhymeGroup.includes(words[newIndex].toUpperCase()) && newIndex !== currentIndex);
          }
          setCurrentIndex(newIndex);
          onNewWord();
        } else {
          // Fallback to simple navigation if no rhyme data
          navigate(key === 'arrowright' ? 'next' : 'prev');
        }
        return;
      }

      // Vertical navigation (Up/Down Arrows)
      if (key === 'arrowup' || key === 'arrowdown') {
        if (rhymeGroups) {
          const nextRhyme = getNextRhyme(); // Assuming getNextRhyme handles direction
          if (nextRhyme) {
            const nextIndex = words.indexOf(nextRhyme);
            if (nextIndex !== -1) {
              setCurrentIndex(nextIndex);
            }
          }
        } else {
          // Fallback to simple navigation if no rhyme data
          navigate(key === 'arrowdown' ? 'next' : 'prev');
        }
        return;
      }
    }
  }, [
    words,
    currentIndex,
    setCurrentIndex,
    wordLength,
    setWordLength,
    onNewWord,
    onConfetti,
    getNextRhyme,
    toggleCaseMode,
    rhymeGroups
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { caseMode, toggleCaseMode };
};