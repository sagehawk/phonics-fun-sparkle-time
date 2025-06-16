
import React, { useState, useEffect, useRef } from 'react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import ConfettiButton from './ConfettiButton';
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

  // Audio refs
  const letterSoundRef = useRef<HTMLAudioElement>(null);
  const confettiSoundRef = useRef<HTMLAudioElement>(null);

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
        // Ignore audio play errors (common on first user interaction)
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
        setCurrentIndex(index);
        playSound(letterSoundRef);
      } else if (key === 'arrowright' || key === ' ') {
        event.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % currentContent.length);
        playSound(letterSoundRef);
      } else if (key === 'arrowleft') {
        event.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + currentContent.length) % currentContent.length);
        playSound(letterSoundRef);
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
  }, [currentContent.length, wordLength, audioEnabled]);

  // Mouse wheel zoom functionality
  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch/click navigation
  const handleScreenClick = (event) => {
    const screenWidth = window.innerWidth;
    const clickX = event.clientX;
    
    if (clickX > screenWidth / 2) {
      // Right side - next
      setCurrentIndex((prev) => (prev + 1) % currentContent.length);
    } else {
      // Left side - previous
      setCurrentIndex((prev) => (prev - 1 + currentContent.length) % currentContent.length);
    }
    playSound(letterSoundRef);
  };

  // Reset index when word length changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [wordLength]);

  // Load saved preferences
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

  // Save preferences
  useEffect(() => {
    localStorage.setItem('phonicsWordLength', wordLength.toString());
    localStorage.setItem('phonicsLetterCase', letterCase);
    localStorage.setItem('phonicsDarkMode', isDarkMode.toString());
    localStorage.setItem('phonicsAudioEnabled', audioEnabled.toString());
    localStorage.setItem('phonicsZoomLevel', zoomLevel.toString());
  }, [wordLength, letterCase, isDarkMode, audioEnabled, zoomLevel]);

  const formatDisplayText = (text) => {
    // Dynamic capitalization based on caps lock and shift
    if (wordLength === 1) {
      const shouldCapitalize = capsLockActive || shiftPressed;
      if (shouldCapitalize) {
        return text.toUpperCase();
      }
      return text.toLowerCase();
    }

    // For words, use the letterCase setting
    switch(letterCase) {
      case 'uppercase': return text.toUpperCase();
      case 'both': return text.toLowerCase() + ' ' + text.toUpperCase();
      default: return text.toLowerCase();
    }
  };

  const handleConfettiTrigger = () => {
    setShowConfetti(true);
    playSound(confettiSoundRef);
  };

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-amber-50'}`}>
      {/* Audio elements */}
      <audio ref={letterSoundRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeIHp5jWfIdW9fKKrms5fWaNaBCw==" type="audio/wav" />
      </audio>
      <audio ref={confettiSoundRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeA==" type="audio/wav" />
      </audio>

      {/* Header with controls */}
      <div className="p-4 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Phonics Fun for Toddlers
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
        className="flex-1 flex items-center justify-center cursor-pointer select-none"
        onClick={handleScreenClick}
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <LetterDisplay 
          text={formatDisplayText(currentItem)}
          isDarkMode={isDarkMode}
          showConfetti={showConfetti}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />
      </div>

      {/* Confetti button */}
      <ConfettiButton 
        onCelebrate={handleConfettiTrigger}
        onComplete={() => setShowConfetti(false)}
        isDarkMode={isDarkMode}
      />

      {/* Instructions */}
      <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Click left/right sides to navigate • Press letter keys for direct access • Use arrow keys or spacebar • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default PhonicsApp;
