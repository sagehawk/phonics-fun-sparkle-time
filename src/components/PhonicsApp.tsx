
import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useImageAPI } from '../hooks/useImageAPI';

const PhonicsApp: React.FC = () => {
  const [wordLength, setWordLength] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3);
  const [showImage, setShowImage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const touchHandledRef = useRef(false);
  const touchCountRef = useRef(0);

  // Content arrays for different word lengths
  const singleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const twoLetterWords = ['AT', 'BE', 'GO', 'HE', 'IF', 'IN', 'IS', 'IT', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'WE'];
  const threeLetterWords = ['AND', 'ARE', 'BUT', 'CAN', 'CAR', 'CAT', 'DOG', 'EAT', 'FOR', 'GET', 'GOT', 'HAD', 'HAS', 'HER', 'HIM', 'HIS', 'HOW', 'ITS', 'LET', 'MAY', 'NEW', 'NOT', 'NOW', 'OLD', 'ONE', 'OUR', 'OUT', 'PUT', 'RUN', 'SAY', 'SHE', 'THE', 'TOO', 'TWO', 'USE', 'WAS', 'WAY', 'WHO', 'WIN', 'YES', 'YET', 'YOU'];
  const fourLetterWords = ['BACK', 'BEEN', 'CALL', 'CAME', 'COME', 'EACH', 'FIND', 'GIVE', 'GOOD', 'HAVE', 'HERE', 'JUST', 'KNOW', 'LAST', 'LEFT', 'LIFE', 'LIKE', 'LIVE', 'LOOK', 'MADE', 'MAKE', 'MANY', 'MORE', 'MOST', 'MOVE', 'MUCH', 'NAME', 'NEED', 'NEXT', 'ONLY', 'OVER', 'PART', 'PLAY', 'RIGHT', 'SAID', 'SAME', 'SEEM', 'SHOW', 'SOME', 'TAKE', 'TELL', 'THAN', 'THAT', 'THEM', 'THEY', 'THIS', 'TIME', 'VERY', 'WANT', 'WELL', 'WENT', 'WERE', 'WHAT', 'WHEN', 'WILL', 'WITH', 'WORD', 'WORK', 'YEAR', 'YOUR'];

  const getCurrentContent = () => {
    switch (wordLength) {
      case 1: return singleLetters;
      case 2: return twoLetterWords;
      case 3: return threeLetterWords;
      case 4: return fourLetterWords;
      default: return singleLetters;
    }
  };

  const currentContent = getCurrentContent();

  const handleConfettiTrigger = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
      setIsAnimating(false);
    }, 2000);
  };

  const { caseMode, toggleCaseMode } = useKeyboardControls(
    currentContent,
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

  const playNavigationAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch(console.log);
    }
  };

  // Calculate maximum zoom based on word length and screen size
  const getMaxZoom = () => {
    const baseMax = 8;
    const lengthFactor = wordLength === 1 ? 1 : wordLength === 2 ? 0.8 : wordLength === 3 ? 0.6 : 0.4;
    return baseMax * lengthFactor;
  };

  const currentDisplayText = caseMode === 'uppercase' 
    ? currentContent[currentIndex] 
    : currentContent[currentIndex].toLowerCase();

  useEffect(() => {
    setCurrentIndex(0);
    setShowImage(false);
    // Auto-adjust zoom if current zoom exceeds new maximum
    const maxZoom = getMaxZoom();
    if (zoomLevel > maxZoom) {
      setZoomLevel(maxZoom);
    }
  }, [wordLength, zoomLevel]);

  useEffect(() => {
    playNavigationAudio();
  }, [currentIndex]);

  const handleShowImage = async () => {
    if (!showImage) {
      await searchImage(currentContent[currentIndex]);
    }
    setShowImage(!showImage);
  };

  const handleLetterAreaClick = (side: 'left' | 'right' | 'center') => {
    if (side === 'center') {
      toggleCaseMode();
    }
  };

  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Check if this is a multi-touch event
    if ('touches' in e && e.touches.length > 1) {
      return;
    }
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    const x = clientX - rect.left;
    const width = rect.width;
    
    // Only handle side clicks if not clicking on buttons or letter
    const clickedElement = e.target as HTMLElement;
    if (clickedElement.closest('button') || clickedElement.closest('[data-letter-display]')) {
      return;
    }
    
    setShowImage(false);
    
    // Side navigation zones
    if (x < width * 0.4) {
      const newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
      setCurrentIndex(newIndex);
      playNavigationAudio();
    } else if (x > width * 0.6) {
      const newIndex = (currentIndex + 1) % currentContent.length;
      setCurrentIndex(newIndex);
      playNavigationAudio();
    }
  };

  const handleScreenTouchStart = (e: React.TouchEvent) => {
    touchCountRef.current = e.touches.length;
  };

  const handleScreenTouchEnd = (e: React.TouchEvent) => {
    // Only handle single touch
    if (touchCountRef.current === 1 && e.changedTouches.length === 1) {
      touchHandledRef.current = true;
      handleScreenClick(e);
      setTimeout(() => {
        touchHandledRef.current = false;
      }, 300);
    }
    touchCountRef.current = 0;
  };

  const handleScreenMouseClick = (e: React.MouseEvent) => {
    if (touchHandledRef.current) {
      return;
    }
    handleScreenClick(e);
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50'
    } flex flex-col select-none overflow-hidden`}>
      
      {/* Header with logo, learning mode, and dark mode toggle */}
      <div className={`p-2 md:p-4 border-b transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-orange-200 bg-orange-100/50'
      } backdrop-blur-sm flex-shrink-0`}>
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <img 
            src="https://i.imgur.com/wgCFzsE.png" 
            alt="Simple Phonics Logo" 
            className="h-8 md:h-12 object-contain"
          />
          
          <div className="flex items-center gap-4">
            <WordLengthSlider 
              value={wordLength} 
              onChange={setWordLength} 
              isDarkMode={isDarkMode} 
            />
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
              }`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div 
        className="flex-grow flex flex-col items-center justify-center p-4 min-h-0 relative cursor-pointer"
        style={{ 
          paddingTop: '2vh', 
          paddingBottom: '2vh',
          minHeight: 'calc(100vh - 120px)'
        }}
        onClick={handleScreenMouseClick}
        onTouchStart={handleScreenTouchStart}
        onTouchEnd={handleScreenTouchEnd}
      >
        <div className="w-full h-full flex items-center justify-center">
          <LetterDisplay 
            text={currentDisplayText} 
            isDarkMode={isDarkMode}
            showConfetti={showConfetti}
            zoomLevel={zoomLevel}
            onZoomChange={(level) => setZoomLevel(Math.min(level, getMaxZoom()))}
            showImage={showImage}
            imageData={currentImageData}
            onLetterAreaClick={handleLetterAreaClick}
            isClickable={true}
            maxZoom={getMaxZoom()}
          />
        </div>

        {/* Audio elements */}
        <audio ref={audioRef} src="/sounds/click.mp3" />
      </div>
    </div>
  );
};

export default PhonicsApp;
