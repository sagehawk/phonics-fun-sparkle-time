
import React, { useState, useEffect, useRef } from 'react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import ConfettiButton from './ConfettiButton';
import ShowImageButton from './ShowImageButton';
import SettingsPanel from './SettingsPanel';
import { Sun, Moon } from 'lucide-react';

const PhonicsApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordLength, setWordLength] = useState(1);
  const [letterCase, setLetterCase] = useState('lowercase');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [lastDisplayedText, setLastDisplayedText] = useState('');

  // Audio refs
  const letterSoundRef = useRef<HTMLAudioElement>(null);
  const confettiSoundRef = useRef<HTMLAudioElement>(null);

  // Content arrays for different word lengths
  const singleLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const twoLetterWords = ['at', 'in', 'it', 'on', 'of', 'to', 'an', 'as', 'be', 'go', 'he', 'me', 'we', 'up', 'so', 'no', 'my', 'by', 'do', 'or'];
  const threeLetterWords = ['cat', 'dog', 'sun', 'pig', 'fan', 'top', 'cup', 'bag', 'hat', 'pen', 'log', 'web', 'jam', 'box', 'fox', 'bed', 'red', 'leg', 'egg', 'hug'];
  const fourLetterWords = ['frog', 'clap', 'swim', 'flag', 'stop', 'jump', 'play', 'moon', 'star', 'fish', 'bird', 'book', 'cake', 'tree', 'ball', 'duck', 'hand', 'door', 'rain', 'snow'];

  // Letter to image mapping for Mode 1
  const letterImages = {
    a: 'apple', b: 'ball', c: 'cat', d: 'dog', e: 'elephant', f: 'fish', g: 'guitar', h: 'house',
    i: 'ice cream', j: 'juice', k: 'kite', l: 'lion', m: 'moon', n: 'nest', o: 'orange', p: 'pig',
    q: 'queen', r: 'rainbow', s: 'sun', t: 'tree', u: 'umbrella', v: 'violin', w: 'water', x: 'xylophone',
    y: 'yellow', z: 'zebra'
  };

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

  // Play sound helper with conditional logic
  const playSound = (audioRef: React.RefObject<HTMLAudioElement>, force = false) => {
    if (audioEnabled && audioRef.current && force) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  // Enhanced keyboard navigation with caps lock and shift detection
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Detect caps lock
      setCapsLockActive(event.getModifierState('CapsLock'));
      
      // Detect shift
      if (event.key === 'Shift') {
        setShiftPressed(true);
      }

      const key = event.key.toLowerCase();
      if (wordLength === 1 && key.match(/[a-z]/)) {
        const index = key.charCodeAt(0) - 97; // 'a' = 97
        const newIndex = index;
        
        // Only play sound if content actually changes
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          playSound(letterSoundRef, true);
        }
      } else if (key === 'arrowright' || key === ' ') {
        event.preventDefault();
        const newIndex = (currentIndex + 1) % currentContent.length;
        setCurrentIndex(newIndex);
        playSound(letterSoundRef, true);
      } else if (key === 'arrowleft') {
        event.preventDefault();
        const newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
        setCurrentIndex(newIndex);
        playSound(letterSoundRef, true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        setShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentContent.length, wordLength, audioEnabled, currentIndex]);

  // Mouse wheel zoom functionality with increased max zoom
  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta))); // Increased max zoom to 5
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch/click navigation
  const handleScreenClick = (event) => {
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
    playSound(letterSoundRef, true);
  };

  // Reset index when word length changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [wordLength]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedWordLength = localStorage.getItem('phonicsWordLength');
    const savedLetterCase = localStorage.getItem('phonicsLetterCase');
    const savedDarkMode = localStorage.getItem('phonicsDarkMode');
    const savedAudioEnabled = localStorage.getItem('phonicsAudioEnabled');
    const savedZoomLevel = localStorage.getItem('phonicsZoomLevel');
    
    if (savedWordLength) setWordLength(parseInt(savedWordLength));
    if (savedLetterCase) setLetterCase(savedLetterCase);
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
    if (savedAudioEnabled) setAudioEnabled(savedAudioEnabled === 'true');
    if (savedZoomLevel) setZoomLevel(parseFloat(savedZoomLevel));
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('phonicsWordLength', wordLength.toString());
    localStorage.setItem('phonicsLetterCase', letterCase);
    localStorage.setItem('phonicsDarkMode', isDarkMode.toString());
    localStorage.setItem('phonicsAudioEnabled', audioEnabled.toString());
    localStorage.setItem('phonicsZoomLevel', zoomLevel.toString());
  }, [wordLength, letterCase, isDarkMode, audioEnabled, zoomLevel]);

  // Track displayed text changes for conditional sound playing
  const formatDisplayText = (text) => {
    // Dynamic capitalization based on caps lock and shift
    if (wordLength === 1) {
      const shouldCapitalize = capsLockActive || shiftPressed;
      return shouldCapitalize ? text.toUpperCase() : text.toLowerCase();
    }

    // For words, use the letterCase setting
    switch(letterCase) {
      case 'uppercase': return text.toUpperCase();
      case 'both': return text.toLowerCase() + ' ' + text.toUpperCase();
      default: return text.toLowerCase();
    }
  };

  const currentDisplayText = formatDisplayText(currentItem);

  // Play sound only when display text actually changes
  useEffect(() => {
    if (lastDisplayedText && lastDisplayedText !== currentDisplayText) {
      playSound(letterSoundRef, true);
    }
    setLastDisplayedText(currentDisplayText);
  }, [currentDisplayText, audioEnabled]);

  const handleConfettiTrigger = () => {
    setShowConfetti(true);
    playSound(confettiSoundRef, true);
  };

  const handleShowImage = () => {
    setShowImage(true);
    setTimeout(() => {
      setShowImage(false);
    }, 3000);
  };

  // Determine if image is available for current content
  const hasImageAvailable = () => {
    if (wordLength === 1) {
      return letterImages[currentItem.toLowerCase()] !== undefined;
    }
    // For words, assume images are available (could be enhanced with actual availability check)
    return true;
  };

  const getCurrentImageQuery = () => {
    if (wordLength === 1) {
      return letterImages[currentItem.toLowerCase()] || currentItem;
    }
    return currentItem;
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-300 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <img src="/logo.svg" alt="Simple Phonics" className="h-12" />
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </header>
      
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-8">
        <LetterDisplay
          text={currentItem}
=======
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-amber-50'}`}>
      {/* Audio elements */}
      <audio ref={letterSoundRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeIHp5jWfIdW9fKKrms5fWaNaBCw==" type="audio/wav" />
      </audio>
      <audio ref={confettiSoundRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeA==" type="audio/wav" />
      </audio>

      {/* Header with controls */}
      <div className="p-4 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Simple Phonics
        </h1>
        
        <div className="flex items-center gap-4">
          <WordLengthSlider 
            value={wordLength} 
            onChange={setWordLength}
            isDarkMode={isDarkMode}
          />
          
          <SettingsPanel 
            letterCase={letterCase}
            onLetterCaseChange={setLetterCase}
            isDarkMode={isDarkMode}
            audioEnabled={audioEnabled}
            onAudioToggle={setAudioEnabled}
            capsLockActive={capsLockActive}
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
>>>>>>> parent of 4e1e6d9 (Implement Simple Phonics v3.0 features)
          showConfetti={showConfetti}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          showImage={showImage}
<<<<<<< HEAD
          imageUrl={currentImageData?.url}
        />
      
        <div className="flex items-center justify-center space-x-4">
          <ConfettiButton
            onClick={() => {
              setShowConfetti(true);
              if (confettiSoundRef.current && audioEnabled) {
                confettiSoundRef.current.play();
              }
            }}
          />
          <ShowImageButton
            onClick={() => {
              setShowImage(true);
              if (!currentImageData || lastDisplayedText !== currentItem) {
                fetchImage(currentItem).then(data => {
                  if (data) {
                    setCurrentImageData(data);
                    setLastDisplayedText(currentItem);
                  }
                });
              }
            }}
          />
        </div>
      
        <WordLengthSlider value={wordLength} onChange={setWordLength} />
        <SettingsPanel
          audioEnabled={audioEnabled}
          onAudioToggle={() => setAudioEnabled(!audioEnabled)}
        />
      </main>
      
      <audio ref={letterSoundRef} src="/sounds/pop.mp3" />
      <audio ref={confettiSoundRef} src="/sounds/celebration.mp3" />
=======
          imageQuery={getCurrentImageQuery()}
        />
      </div>

      {/* Show Image button (bottom-left) */}
      {hasImageAvailable() && (
        <ShowImageButton
          onShowImage={handleShowImage}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Confetti button (bottom-right) */}
      <ConfettiButton 
        onCelebrate={handleConfettiTrigger}
        onComplete={() => setShowConfetti(false)}
        isDarkMode={isDarkMode}
      />

      {/* Instructions */}
      <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Click left/right sides to navigate • Press letter keys for direct access • Use arrow keys or spacebar • Scroll to zoom</p>
      </div>
>>>>>>> parent of 4e1e6d9 (Implement Simple Phonics v3.0 features)
    </div>
  );
};

export default PhonicsApp;
