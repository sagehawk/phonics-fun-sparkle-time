import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LetterDisplay from './LetterDisplay';
import ConfettiButton from './ConfettiButton';
import ShowImageButton from './ShowImageButton';
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
  const celebrationAudioRef = useRef<HTMLAudioElement>(null);

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
    
    // Play celebration sound only for confetti
    if (celebrationAudioRef.current) {
      celebrationAudioRef.current.currentTime = 0;
      celebrationAudioRef.current.play().catch(console.log);
    }
    
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
      audioRef.current.play().catch(console.log);
    }
  };

  const currentDisplayText = caseMode === 'uppercase' 
    ? currentContent[currentIndex] 
    : currentContent[currentIndex].toLowerCase();

  useEffect(() => {
    setCurrentIndex(0);
    setShowImage(false);
  }, [wordLength]);

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
      if (wordLength === 1) {
        toggleCaseMode();
      }
    } else if (side === 'left') {
      const newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
      setCurrentIndex(newIndex);
      setShowImage(false);
      playNavigationAudio();
    } else if (side === 'right') {
      const newIndex = (currentIndex + 1) % currentContent.length;
      setCurrentIndex(newIndex);
      setShowImage(false);
      playNavigationAudio();
    }
  };

  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
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
    if (x < width * 0.25) {
      // Left 25% of screen
      const newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
      setCurrentIndex(newIndex);
      playNavigationAudio();
    } else if (x > width * 0.75) {
      // Right 25% of screen
      const newIndex = (currentIndex + 1) % currentContent.length;
      setCurrentIndex(newIndex);
      playNavigationAudio();
    }
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } flex flex-col select-none overflow-hidden`}>
      
      {/* Header with logo and controls */}
      <div className={`p-2 md:p-4 border-b transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm flex-shrink-0`}>
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <img 
            src="https://i.imgur.com/wgCFzsE.png" 
            alt="Simple Phonics Logo" 
            className="h-8 md:h-12 object-contain"
          />
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Word Length Selector */}
      <div className="p-2 md:p-4 flex justify-center flex-shrink-0">
        <WordLengthSlider 
          value={wordLength} 
          onChange={setWordLength} 
          isDarkMode={isDarkMode} 
        />
      </div>

      {/* Main content area - better mobile positioning */}
      <div 
        className="flex-grow flex flex-col items-center justify-center p-4 min-h-0 relative cursor-pointer"
        style={{ 
          paddingTop: '5vh', 
          paddingBottom: '20vh',
          minHeight: 'calc(100vh - 300px)'
        }}
        onClick={handleScreenClick}
        onTouchEnd={handleScreenClick}
      >
        <div className="w-full h-full flex items-center justify-center" style={{ transform: 'translateY(-5vh)' }}>
          <LetterDisplay 
            text={currentDisplayText} 
            isDarkMode={isDarkMode} 
            showConfetti={showConfetti} 
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            showImage={showImage}
            imageData={currentImageData}
            onLetterAreaClick={handleLetterAreaClick}
            isClickable={true}
          />
        </div>
      </div>

      {/* Action buttons - fixed positioning with safe area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex md:justify-end justify-between items-center px-4 pb-4 md:pb-8 pointer-events-auto"
             style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="md:hidden">
            <ShowImageButton 
              onShowImage={handleShowImage} 
              isDarkMode={isDarkMode}
            />
          </div>
          
          <div className="hidden md:flex gap-4">
            <ShowImageButton 
              onShowImage={handleShowImage} 
              isDarkMode={isDarkMode}
            />
            <ConfettiButton 
              onCelebrate={handleConfettiTrigger} 
              onComplete={() => {}}
              isDarkMode={isDarkMode}
            />
          </div>
          
          <div className="md:hidden">
            <ConfettiButton 
              onCelebrate={handleConfettiTrigger} 
              onComplete={() => {}}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Audio elements */}
      <audio ref={audioRef} preload="auto">
        <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
        <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" type="audio/mpeg" />
      </audio>
      
      <audio ref={celebrationAudioRef} preload="auto">
        <source src="https://www.myinstants.com/media/sounds/confetti-pop-sound.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default PhonicsApp;
