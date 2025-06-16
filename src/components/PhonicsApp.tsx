
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-300 bg-background">
      <div className="mb-8">
        <img src="/logo.svg" alt="Simple Phonics" className="w-48 h-auto" />
      </div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-accent"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <SettingsPanel
          caseMode={wordLength === 1 ? 'uppercase' : 'lowercase'}
          isDarkMode={isDarkMode}
          audioEnabled={audioEnabled}
          onAudioToggle={setAudioEnabled}
        />
      </div>
      <LetterDisplay
        text={currentItem}
        isDarkMode={isDarkMode}
        showConfetti={showConfetti}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        showImage={showImage}
        imageData={currentImageData}
      />
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <ConfettiButton onClick={() => handleConfettiClick()} />
        <ShowImageButton onClick={handleImageButtonClick} />
      </div>
      <WordLengthSlider value={wordLength} onChange={handleWordLengthChange} />
      <audio ref={letterSoundRef} />
      <audio ref={confettiSoundRef} src="/confetti.mp3" />
    </div>
  );
};

export default PhonicsApp;
