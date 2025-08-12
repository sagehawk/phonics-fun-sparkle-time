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

    // Arrow key navigation
    if (wordLength === 0 || wordLength === 1) {
      if (key === 'arrowright' || key === 'arrowdown') {
        event.preventDefault();
        if (words.length > 0) {
          const newIndex = (currentIndex + 1) % words.length;
          setCurrentIndex(newIndex);
          onNewWord();
        }
        return;
      }
      if (key === 'arrowleft' || key === 'arrowup') {
        event.preventDefault();
        if (words.length > 0) {
          const newIndex = (currentIndex - 1 + words.length) % words.length;
          setCurrentIndex(newIndex);
          onNewWord();
        }
        return;
      }
    }

    if (wordLength === 2) {
      if (key === 'arrowright' || key === 'arrowleft') {
        event.preventDefault();
        if (words.length > 0) {
          const newIndex = (key === 'arrowright')
            ? (currentIndex + 1) % words.length
            : (currentIndex - 1 + words.length) % words.length;
          setCurrentIndex(newIndex);
          onNewWord();
        }
        return;
      }
      if (key === 'arrowup' || key === 'arrowdown') {
        event.preventDefault();
        if (words.length > 0) {
          const currentWord = words[currentIndex];
          const firstLetter = currentWord[0];
          const alphabet = 'abcdefghijklmnopqrstuvwxyz';
          const firstLetterIndex = alphabet.indexOf(firstLetter.toLowerCase());
          if (firstLetterIndex !== -1) {
            const nextFirstLetterIndex = (key === 'arrowdown')
              ? (firstLetterIndex + 1) % alphabet.length
              : (firstLetterIndex - 1 + alphabet.length) % alphabet.length;
            const nextFirstLetter = alphabet[nextFirstLetterIndex];
            const newWord = (caseMode === 'uppercase' ? nextFirstLetter.toUpperCase() : nextFirstLetter) + currentWord.slice(1);
            const newIndex = words.indexOf(newWord);
            if (newIndex !== -1) {
              setCurrentIndex(newIndex);
              onNewWord();
            }
          }
        }
        return;
      }
    } else { // For wordLength 3 and 4
      if (key === 'arrowright' || key === 'arrowleft') {
        event.preventDefault();
        if (words.length > 0) {
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
            // Simple navigation
            const newIndex = key === 'arrowright'
              ? (currentIndex + 1) % words.length
              : (currentIndex - 1 + words.length) % words.length;
            setCurrentIndex(newIndex);
            onNewWord();
          }
        }
        return;
      }

      if (key === 'arrowup' || key === 'arrowdown') {
        event.preventDefault();
        if (rhymeGroups) {
          const nextRhyme = getNextRhyme();
          if (nextRhyme) {
            const nextIndex = words.indexOf(nextRhyme);
            if (nextIndex !== -1) {
              setCurrentIndex(nextIndex);
            }
          }
        } else {
          // Simple navigation for up/down as well
          const newIndex = key === 'arrowdown'
            ? (currentIndex + 1) % words.length
            : (currentIndex - 1 + words.length) % words.length;
          setCurrentIndex(newIndex);
          onNewWord();
        }
        return;
      }
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
  }, [words, currentIndex, setCurrentIndex, wordLength, setWordLength, onNewWord, onConfetti, findRhymeGroup, getNextRhyme, toggleCaseMode, rhymeGroups]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { caseMode, toggleCaseMode };
};
