
import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LetterDisplay from './LetterDisplay';
import ConfettiButton from './ConfettiButton';
import ShowImageButton from './ShowImageButton';
import SettingsPanel from './SettingsPanel';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useImageSearch } from '../hooks/useImageSearch';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

const PhonicsApp: React.FC = () => {
  const [wordLength, setWordLength] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Content arrays for different word lengths
  const singleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const twoLetterWords = ['AT', 'BE', 'GO', 'HE', 'IF', 'IN', 'IS', 'IT', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'WE'];
  const threeLetterWords = ['AND', 'ARE', 'BUT', 'CAN', 'CAR', 'CAT', 'DOG', 'EAT', 'FOR', 'GET', 'GOT', 'HAD', 'HAS', 'HER', 'HIM', 'HIS', 'HOW', 'ITS', 'LET', 'MAY', 'NEW', 'NOT', 'NOW', 'OLD', 'ONE', 'OUR', 'OUT', 'PUT', 'RUN', 'SAY', 'SHE', 'THE', 'TOO', 'TWO', 'USE', 'WAS', 'WAY', 'WHO', 'WIN', 'YES', 'YET', 'YOU'];
  const fourLetterWords = ['BACK', 'BEEN', 'CALL', 'CAME', 'COME', 'EACH', 'FIND', 'GIVE', 'GOOD', 'HAVE', 'HERE', 'JUST', 'KNOW', 'LAST', 'LEFT', 'LIFE', 'LIKE', 'LIVE', 'LOOK', 'MADE', 'MAKE', 'MANY', 'MORE', 'MOST', 'MOVE', 'MUCH', 'NAME', 'NEED', 'NEXT', 'ONLY', 'OVER', 'PART', 'PLAY', 'RIGHT', 'SAID', 'SAME', 'SEEM', 'SHOW', 'SOME', 'TAKE', 'TELL', 'THAN', 'THAT', 'THEM', 'THEY', 'THIS', 'TIME', 'VERY', 'WANT', 'WELL', 'WENT', 'WERE', 'WHAT', 'WHEN', 'WILL', 'WITH', 'WORD', 'WORK', 'YEAR', 'YOUR'];
  const fiveLetterWords = ['ABOUT', 'AFTER', 'AGAIN', 'BEING', 'COULD', 'EVERY', 'FIRST', 'FOUND', 'GREAT', 'GROUP', 'HOUSE', 'LARGE', 'PLACE', 'RIGHT', 'SHALL', 'SMALL', 'SOUND', 'STILL', 'THEIR', 'THERE', 'THESE', 'THINK', 'THREE', 'UNDER', 'WATER', 'WHERE', 'WHICH', 'WHILE', 'WORLD', 'WOULD', 'WRITE', 'YOUNG'];

  const getCurrentContent = () => {
    switch (wordLength) {
      case 1: return singleLetters;
      case 2: return twoLetterWords;
      case 3: return threeLetterWords;
      case 4: return fourLetterWords;
      case 5: return fiveLetterWords;
      default: return singleLetters;
    }
  };

  const currentContent = getCurrentContent();
  const { caseMode, toggleCaseMode } = useKeyboardControls(
    currentContent,
    currentIndex,
    setCurrentIndex,
    wordLength,
    () => {
      setShowImage(false);
      if (audioEnabled) {
        playAudio();
      }
    }
  );

  const { searchImage } = useImageSearch();
  const { playAudio } = useAudioPlayback(audioRef);

  const currentDisplayText = caseMode === 'uppercase' 
    ? currentContent[currentIndex] 
    : currentContent[currentIndex].toLowerCase();

  const { imageData } = useImageSearch();
  const currentImageData = imageData;

  useEffect(() => {
    setCurrentIndex(0);
    setShowImage(false);
  }, [wordLength]);

  useEffect(() => {
    if (audioEnabled) {
      playAudio();
    }
  }, [currentIndex, audioEnabled, playAudio]);

  const handleConfettiTrigger = () => {
    setShowConfetti(true);
  };

  const handleShowImage = async () => {
    if (!showImage) {
      await searchImage(currentContent[currentIndex]);
    }
    setShowImage(!showImage);
  };

  const handleScreenClick = () => {
    setShowImage(false);
  };

  const handleLetterClick = () => {
    if (wordLength === 1) {
      toggleCaseMode();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } flex flex-col`}>
      
      {/* Header with logo and controls */}
      <div className={`p-4 border-b transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm`}>
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          {/* Logo - hidden on mobile */}
          <img 
            src="https://i.imgur.com/wgCFzsE.png" 
            alt="Simple Phonics Logo" 
            className="hidden md:block h-20 object-contain"
          />
          
          {/* Mobile: Just the dark mode toggle */}
          <div className="md:hidden w-full flex justify-end">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          {/* Desktop: Settings and dark mode toggle */}
          <div className="hidden md:flex items-center gap-4">
            <SettingsPanel 
              caseMode={caseMode}
              isDarkMode={isDarkMode}
              audioEnabled={audioEnabled}
              onAudioToggle={setAudioEnabled}
            />
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area - centered on mobile */}
      <div 
        className="flex-grow flex flex-col items-center justify-center p-4 min-h-0"
        onClick={handleScreenClick}
      >
        <div className="w-full h-full flex items-center justify-center">
          <LetterDisplay 
            text={currentDisplayText} 
            isDarkMode={isDarkMode} 
            showConfetti={showConfetti} 
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            showImage={showImage}
            imageData={currentImageData}
            onLetterClick={handleLetterClick}
            isClickable={wordLength === 1}
          />
        </div>
      </div>

      {/* Controls at the bottom */}
      <div className="p-4">
        {/* Mobile: Settings panel */}
        <div className="md:hidden mb-4">
          <SettingsPanel 
            caseMode={caseMode}
            isDarkMode={isDarkMode}
            audioEnabled={audioEnabled}
            onAudioToggle={setAudioEnabled}
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center items-center gap-4">
          <ConfettiButton 
            onCelebrate={handleConfettiTrigger} 
            onComplete={() => setShowConfetti(false)}
            isDarkMode={isDarkMode}
          />
          <ShowImageButton 
            onShowImage={handleShowImage} 
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
};

export default PhonicsApp;
