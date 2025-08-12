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

// Constants for magic numbers
const PREVIOUS_ITEM_CLICK_AREA = 0.4;
const NEXT_ITEM_CLICK_AREA = 0.6;

const PhonicsApp: React.FC = () => { // Force reload
  const {
    language,
    setLanguage,
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

  const handleConfettiTrigger = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  const playNavigationAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(console.log);
    }
  };

  const { caseMode, toggleCaseMode } = useKeyboardControls(
    content,
    currentIndex,
    setCurrentIndex,
    wordLength,
    setWordLength,
    () => {
      setShowImage(false);
      playNavigationAudio();
    },
    handleConfettiTrigger,
    findRhymeGroup,
    getNextRhyme,
    rhymeGroups
  );

  const { fetchImage } = useImageAPI();
  const [currentImageData, setCurrentImageData] = useState<{ url: string; searchTerm: string } | null>(null);

  const searchImage = async (text: string) => {
    try {
      const result = await fetchImage(text, wordLength === 1);
      if (result) {
        setCurrentImageData(result);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const currentDisplayText = (language === 'en' && caseMode === 'lowercase')
    ? (content[currentIndex] || '').toLowerCase()
    : content[currentIndex] || '';

  const handleCycleFirstLetter = () => {
    const nextRhyme = getNextRhyme();
    if (nextRhyme) {
      const nextIndex = content.indexOf(nextRhyme);
      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
      }
    }
  };

  const handleCycleWholeWord = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    setShowImage(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clickX = x - rect.left;

    if (rhymeGroups) {
      const currentWord = content[currentIndex];
      const currentRhymeGroup = Object.values(rhymeGroups).find(group => group.includes(currentWord.toUpperCase()));

      let newIndex = currentIndex;
      if (clickX < rect.width * PREVIOUS_ITEM_CLICK_AREA) {
        do {
          newIndex = (newIndex - 1 + content.length) % content.length;
        } while (currentRhymeGroup && currentRhymeGroup.includes(content[newIndex].toUpperCase()) && newIndex !== currentIndex);
      } else if (clickX > rect.width * NEXT_ITEM_CLICK_AREA) {
        do {
          newIndex = (newIndex + 1) % content.length;
        } while (currentRhymeGroup && currentRhymeGroup.includes(content[newIndex].toUpperCase()) && newIndex !== currentIndex);
        }
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    if (currentDisplayText) {
      findRhymeGroup(currentDisplayText);
    }
  }, [currentDisplayText, findRhymeGroup]);

  useEffect(() => {
    setCurrentIndex(0);
    setShowImage(false);
    setShowTransliteration(false);
  }, [wordLength, language]);

  useEffect(() => {
    playNavigationAudio();
  }, [currentIndex]);

  const handleShowImage = async () => {
    if (!showImage && content[currentIndex]) {
      await searchImage(content[currentIndex]);
    }
    setShowImage(!showImage);
  };

  const handleLetterLongPress = () => {
    if (language === 'ar' || language === 'fa') {
      setShowTransliteration(!showTransliteration);
    } else {
      toggleCaseMode();
    }
  };

  const handleInteraction = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    // Check if the click is on the LetterDisplay component or any of its children. If so, do nothing.
    if ((e.target as HTMLElement).closest('[data-letter-display]')) {
      return;
    }

    if (wordLength === 0 || wordLength === 1) {
      setShowImage(false);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clickX = x - rect.left;

      if (clickX < rect.width * PREVIOUS_ITEM_CLICK_AREA) {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + content.length) % content.length);
      } else if (clickX > rect.width * NEXT_ITEM_CLICK_AREA) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
      }
    } else { // For wordLength 2, 3 and 4
      handleCycleFirstLetter();
    }
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
        : 'bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50'
    } flex flex-col select-none overflow-hidden`}>

      {/* Header */}
      <header className={`px-4 py-3 border-b transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800/90' : 'border-stone-200 bg-stone-50/90'
      } backdrop-blur-sm flex-shrink-0 shadow-sm`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
              Simple Phonics
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <WordLengthSlider
              value={wordLength}
              onChange={setWordLength}
            />

            

            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
              }`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main
        className="flex-grow flex flex-col items-center justify-center p-4 min-h-0 relative"
        style={{
          paddingTop: '2vh',
          paddingBottom: '2vh',
          minHeight: 'calc(100vh - 120px)'
        }}
        onClick={handleCycleWholeWord}
        onTouchEnd={handleCycleWholeWord}
      >
        <LetterDisplay
          text={currentDisplayText}
          showConfetti={showConfetti}
          showImage={showImage}
          imageData={currentImageData}
          onLetterAreaClick={handleInteraction}
          onLetterLongPress={handleLetterLongPress}
          isClickable={true}
          language={language}
          showTransliteration={showTransliteration}
          transliteration={content[currentIndex] ? getTransliteration(content[currentIndex]) : ''}
        />

        <audio ref={audioRef} src={audioData} />
        <Instructions />
      </main>
    </div>
  );
};

export default PhonicsApp;
