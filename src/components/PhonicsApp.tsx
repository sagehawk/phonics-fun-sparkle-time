import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import LanguageSelector from './LanguageSelector';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useImageAPI } from '../hooks/useImageAPI';
import { usePhonics } from '../hooks/usePhonics';
import { useTheme } from '../contexts/ThemeContext';
import { audioData } from '../data/audio';

// Constants for magic numbers
const PREVIOUS_ITEM_CLICK_AREA = 0.4;
const NEXT_ITEM_CLICK_AREA = 0.6;
const BASE_MAX_ZOOM = 8;
const MOBILE_MAX_ZOOM_FACTOR = 0.6;
const TRANSLITERATION_MAX_ZOOM_FACTOR = 0.7;
const MOBILE_WIDTH_THRESHOLD = 768;

const PhonicsApp: React.FC = () => {
  const {
    language,
    setLanguage,
    wordLength,
    setWordLength,
    content,
    getTransliteration,
  } = usePhonics();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3);
  const [showImage, setShowImage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleConfettiTrigger = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      setIsAnimating(false);
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
    () => {
      setShowImage(false);
      playNavigationAudio();
    },
    handleConfettiTrigger
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

  const getMaxZoom = () => {
    const lengthFactor = wordLength === 1 ? 1 : wordLength === 2 ? 0.8 : wordLength === 3 ? 0.6 : 0.4;
    const transliterationFactor = ((language === 'ar' || language === 'fa') && showTransliteration) ? TRANSLITERATION_MAX_ZOOM_FACTOR : 1;
    const mobileFactor = window.innerWidth <= MOBILE_WIDTH_THRESHOLD ? MOBILE_MAX_ZOOM_FACTOR : 1; // Smaller max zoom on mobile
    return BASE_MAX_ZOOM * lengthFactor * transliterationFactor * mobileFactor;
  };

  const currentDisplayText = (language === 'en' && caseMode === 'lowercase')
    ? (content[currentIndex] || '').toLowerCase()
    : content[currentIndex] || '';

  useEffect(() => {
    setCurrentIndex(0);
    setShowImage(false);
    setShowTransliteration(false);
    const maxZoom = getMaxZoom();
    if (zoomLevel > maxZoom) {
      setZoomLevel(maxZoom);
    }
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

  const handleInteraction = (x: number, width: number) => {
    setShowImage(false);
    if (x < width * PREVIOUS_ITEM_CLICK_AREA) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + content.length) % content.length);
    } else if (x > width * NEXT_ITEM_CLICK_AREA) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
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

            <LanguageSelector
              value={language}
              onChange={setLanguage}
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
      >
        <button
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleInteraction(e.clientX - rect.left, rect.width);
            }}
            onTouchEnd={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleInteraction(e.changedTouches[0].clientX - rect.left, rect.width);
            }}
            aria-label="Main content area"
        >
          <LetterDisplay
            text={currentDisplayText}
            showConfetti={showConfetti}
            zoomLevel={zoomLevel}
            onZoomChange={(level) => setZoomLevel(Math.min(level, getMaxZoom()))}
            showImage={showImage}
            imageData={currentImageData}
            onLetterAreaClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length)}
            onLetterLongPress={handleLetterLongPress}
            isClickable={true}
            maxZoom={getMaxZoom()}
            language={language}
            showTransliteration={showTransliteration}
            transliteration={content[currentIndex] ? getTransliteration(content[currentIndex]) : ''}
          />
        </button>

        <audio ref={audioRef} src={audioData} />
      </main>
    </div>
  );
};

export default PhonicsApp;
