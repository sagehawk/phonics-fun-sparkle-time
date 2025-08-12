import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useImageAPI } from '../hooks/useImageAPI';
import { usePhonics } from '../hooks/usePhonics';
import { useRhymes } from '../hooks/useRhymes';
import { useTheme } from '../contexts/ThemeContext';
import { audioData } from '../data/audio';
import Instructions from './Instructions';

// Constants for click areas
const PREVIOUS_ITEM_CLICK_AREA = 0.4;
const NEXT_ITEM_CLICK_AREA = 0.6;

const PhonicsApp: React.FC = () => {
  // --- State and Hooks Initialization ---
  const {
    language,
    wordLength,
    setWordLength,
    content,
    getTransliteration,
  } = usePhonics();
  
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { findRhymeGroup, getNextRhyme, rhymeGroups } = useRhymes(language, wordLength);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentDisplayText = content[currentIndex] || '';

  // --- FIX #1 (THE CRITICAL FIX): Restore the useEffect that activates the rhyming engine. ---
  // This tells the useRhymes hook which word we are currently on, so that
  // getNextRhyme() knows which rhyme group to cycle through for the arrow keys.
  useEffect(() => {
    if (currentDisplayText) {
      findRhymeGroup(currentDisplayText);
    }
  }, [currentDisplayText, findRhymeGroup]);


  // --- Core Functions & Keyboard Hook Setup ---
  const handleConfettiTrigger = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const playNavigationAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(console.error);
    }
  };

  const onNewWordNavigation = () => {
    setShowImage(false);
    playNavigationAudio();
  };

  const { caseMode, toggleCaseMode } = useKeyboardControls(
    content,
    currentIndex,
    setCurrentIndex,
    wordLength,
    setWordLength,
    onNewWordNavigation,
    handleConfettiTrigger,
    findRhymeGroup,
    getNextRhyme,
    rhymeGroups
  );
  
  const { fetchImage } = useImageAPI();
  const [currentImageData, setCurrentImageData] = useState<{ url: string; searchTerm: string } | null>(null);

  // --- Other useEffects ---
  useEffect(() => {
    setCurrentIndex(0);
    setShowImage(false);
    setShowTransliteration(false);
  }, [wordLength, language]);

  useEffect(() => {
    playNavigationAudio();
  }, [currentIndex]);

  // --- Interaction and Display Logic ---
  const searchImage = async (text: string) => {
    try {
      const result = await fetchImage(text, wordLength === 1);
      if (result) setCurrentImageData(result);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const handleShowImage = async () => {
    if (!showImage && currentDisplayText) {
      await searchImage(currentDisplayText);
    }
    setShowImage(!showImage);
  };

  // --- FIX #2: Untangle the click handlers from the broken `diff` ---
  /**
   * Handles cycling through rhymes when the letter display is clicked.
   * This provides the same functionality as the up/down arrow keys.
   */
  const handleRhymeCycle = () => {
    const nextRhyme = getNextRhyme();
    if (nextRhyme) {
      const nextIndex = content.indexOf(nextRhyme);
      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
      }
    }
  };
  
  /**
   * Handles navigating between word groups when the background is clicked.
   * This provides the same functionality as the left/right arrow keys.
   */
  const handleBackgroundInteraction = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('[data-letter-display]')) return;

    onNewWordNavigation(); // Hide image and play sound

    const rect = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clickX = x - rect.left;

    const isPrevious = clickX < rect.width * PREVIOUS_ITEM_CLICK_AREA;
    const isNext = clickX > rect.width * NEXT_ITEM_CLICK_AREA;

    if (!isPrevious && !isNext) return;

    const step = isNext ? 1 : -1;

    if (wordLength >= 2 && rhymeGroups) {
      const currentWord = content[currentIndex];
      const currentRhymeGroup = Object.values(rhymeGroups).find(group => group.includes(currentWord.toUpperCase()));
      let newIndex = currentIndex;
      do {
        newIndex = (newIndex + step + content.length) % content.length;
      } while (currentRhymeGroup && currentRhymeGroup.includes(content[newIndex].toUpperCase()) && newIndex !== currentIndex);
      setCurrentIndex(newIndex);
    } else {
      setCurrentIndex(prev => (prev + step + content.length) % content.length);
    }
  };

  const handleLetterLongPress = () => {
    if (language === 'ar' || language === 'fa') {
      setShowTransliteration(!showTransliteration);
    } else {
      toggleCaseMode();
    }
  };

  const finalDisplayText = (language === 'en' && caseMode === 'lowercase')
    ? currentDisplayText.toLowerCase()
    : currentDisplayText;

  // --- Render JSX ---
  return (
    <div className={`min-h-screen min-h-[100dvh] transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50'} flex flex-col select-none overflow-hidden`}>
      <header className={`px-4 py-3 border-b transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-800/90' : 'border-stone-200 bg-stone-50/90'} backdrop-blur-sm flex-shrink-0 shadow-sm`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Simple Phonics</h1>
          <div className="flex items-center gap-3">
            <WordLengthSlider value={wordLength} onChange={setWordLength} />
            <button onClick={toggleDarkMode} className={`p-2.5 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-stone-200 text-stone-800 hover:bg-stone-300'}`} aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main
        className="flex-grow flex flex-col items-center justify-center p-4 min-h-0 relative"
        style={{ paddingTop: '2vh', paddingBottom: '2vh', minHeight: 'calc(100vh - 120px)' }}
        onClick={handleBackgroundInteraction} // <--- FIX: Correct handler for background clicks
        onTouchEnd={handleBackgroundInteraction} // <--- FIX: Correct handler for background touches
      >
        <LetterDisplay
          text={finalDisplayText}
          showConfetti={showConfetti}
          showImage={showImage}
          imageData={currentImageData}
          onShowImage={handleShowImage}
          onLetterAreaClick={handleRhymeCycle} // <--- FIX: Correct handler for letter clicks
          onLetterLongPress={handleLetterLongPress}
          isClickable={true}
          language={language}
          showTransliteration={showTransliteration}
          transliteration={getTransliteration(currentDisplayText)}
        />
        <audio ref={audioRef} src={audioData} />
        <Instructions />
      </main>
    </div>
  );
};

export default PhonicsApp;