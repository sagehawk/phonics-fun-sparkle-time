
import React, { useState, useEffect, useRef } from 'react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import ConfettiButton from './ConfettiButton';
import ShowImageButton from './ShowImageButton';
import SettingsPanel from './SettingsPanel';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useImageAPI } from '../hooks/useImageAPI';
import { Sun, Moon } from 'lucide-react';

const PhonicsApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordLength, setWordLength] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<{ url: string; searchTerm: string } | null>(null);
  const [lastDisplayedText, setLastDisplayedText] = useState('');

  // Audio refs
  const letterSoundRef = useRef<HTMLAudioElement>(null);
  const confettiSoundRef = useRef<HTMLAudioElement>(null);

  const { fetchImage } = useImageAPI();

  // Content arrays for different word lengths
  const singleLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const twoLetterWords = ['at', 'in', 'it', 'on', 'of', 'to', 'an', 'as', 'be', 'go', 'he', 'me', 'we', 'up', 'so', 'no', 'my', 'by', 'do', 'or'];
  const threeLetterWords = ['cat', 'dog', 'sun', 'pig', 'fan', 'top', 'cup', 'bag', 'hat', 'pen', 'log', 'web', 'jam', 'box', 'fox', 'bed', 'red', 'leg', 'egg', 'hug'];
  const fourLetterWords = ['frog', 'clap', 'swim', 'flag', 'stop', 'jump', 'play', 'moon', 'star', 'fish', 'bird', 'book', 'cake', 'tree', 'ball', 'duck', 'hand', 'door', 'rain', 'snow'];

  const getCurrentContent = () => {
    switch(wordLength) {
      case 1: return singleLetters;
      case 2: return twoLetterWords;
      case 3: return threeLetterWords;
      case 4: return fourLetterWords;
      default: return singleLetters;
    }
  };

  const currentContent = getCurrentContent();
  const currentItem = currentContent[currentIndex % currentContent.length];

  // Play sound helper
  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const handleContentChange = () => {
    playSound(letterSoundRef);
    // Hide image immediately if it's showing when content changes
    if (showImage) {
      setShowImage(false);
      setCurrentImageData(null);
    }
  };

  // Enhanced keyboard navigation with simplified logic
  const { caseMode } = useKeyboardControls(
    currentContent,
    currentIndex,
    setCurrentIndex,
    wordLength,
    handleContentChange
  );

  // Enhanced mouse wheel zoom functionality with increased sensitivity
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.2 : 0.2; // Increased sensitivity
      setZoomLevel(prev => Math.max(0.5, Math.min(8, prev + delta))); // Increased max zoom
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch/click navigation
  const handleScreenClick = (event: React.MouseEvent) => {
    const screenWidth = window.innerWidth;
    const clickX = event.clientX;
    
    let newIndex;
    if (clickX > screenWidth / 2) {
      // Right side - next
      newIndex = (currentIndex + 1) % currentContent.length;
    } else {
      // Left side - previous
      newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
    }
    
    setCurrentIndex(newIndex);
    handleContentChange();
  };

  // Reset index when word length changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [wordLength]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedWordLength = localStorage.getItem('phonicsWordLength');
    const savedDarkMode = localStorage.getItem('phonicsDarkMode');
    const savedAudioEnabled = localStorage.getItem('phonicsAudioEnabled');
    const savedZoomLevel = localStorage.getItem('phonicsZoomLevel');
    
    if (savedWordLength) setWordLength(parseInt(savedWordLength));
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
    if (savedAudioEnabled) setAudioEnabled(savedAudioEnabled === 'true');
    if (savedZoomLevel) setZoomLevel(parseFloat(savedZoomLevel));
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('phonicsWordLength', wordLength.toString());
    localStorage.setItem('phonicsDarkMode', isDarkMode.toString());
    localStorage.setItem('phonicsAudioEnabled', audioEnabled.toString());
    localStorage.setItem('phonicsZoomLevel', zoomLevel.toString());
  }, [wordLength, isDarkMode, audioEnabled, zoomLevel]);

  // Format display text based on case mode
  const formatDisplayText = (text: string) => {
    return caseMode === 'uppercase' ? text.toUpperCase() : text.toLowerCase();
  };

  const currentDisplayText = formatDisplayText(currentItem);

  // Play sound only when display text actually changes
  useEffect(() => {
    if (lastDisplayedText && lastDisplayedText !== currentDisplayText) {
      playSound(letterSoundRef);
    }
    setLastDisplayedText(currentDisplayText);
  }, [currentDisplayText, audioEnabled]);

  const handleConfettiTrigger = () => {
    setShowConfetti(true);
    playSound(confettiSoundRef);
  };

  const handleShowImage = async () => {
    const imageData = await fetchImage(currentItem, wordLength === 1);
    if (imageData) {
      setCurrentImageData(imageData);
      setShowImage(true);
      setTimeout(() => {
        setShowImage(false);
        setCurrentImageData(null);
      }, 3000);
    }
  };

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-amber-50'}`}>
      {/* Audio elements */}
      <audio ref={letterSoundRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeIHp5jWfIdW9fKKrms5fWaNaBCw==" type="audio/wav" />
      </audio>
      <audio ref={confettiSoundRef} preload="auto">
        <source src="https://www.myinstants.com/media/sounds/confetti-pop-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Header with controls */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://i.imgur.com/wgCFzsE.png" 
            alt="Simple Phonics" 
            className="h-20 w-auto"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <WordLengthSlider 
            value={wordLength} 
            onChange={setWordLength}
            isDarkMode={isDarkMode}
          />
          
          <SettingsPanel 
            caseMode={caseMode}
            isDarkMode={isDarkMode}
            audioEnabled={audioEnabled}
            onAudioToggle={setAudioEnabled}
          />
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>

      {/* Main learning area */}
      <div 
        className="flex-1 flex items-center justify-center cursor-pointer select-none relative"
        onClick={handleScreenClick}
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <LetterDisplay 
          text={currentDisplayText}
          isDarkMode={isDarkMode}
          showConfetti={showConfetti}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          showImage={showImage}
          imageData={currentImageData}
        />
      </div>

      {/* Responsive button layout */}
      <div className="fixed bottom-6 left-0 right-0 z-20">
        {/* Mobile layout: buttons on opposite sides */}
        <div className="block md:hidden">
          <ShowImageButton
            onShowImage={handleShowImage}
            isDarkMode={isDarkMode}
            className="fixed bottom-6 left-6"
          />
          <ConfettiButton 
            onCelebrate={handleConfettiTrigger}
            onComplete={() => setShowConfetti(false)}
            isDarkMode={isDarkMode}
            className="fixed bottom-6 right-6"
          />
        </div>
        
        {/* Desktop layout: buttons together in bottom-right */}
        <div className="hidden md:block">
          <div className="fixed bottom-6 right-6 flex gap-3">
            <ShowImageButton
              onShowImage={handleShowImage}
              isDarkMode={isDarkMode}
            />
            <ConfettiButton 
              onCelebrate={handleConfettiTrigger}
              onComplete={() => setShowConfetti(false)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Press letter keys for direct access • Press Shift to toggle case • Click left/right to navigate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default PhonicsApp;
