
import React, { useState, useEffect } from 'react';
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();
      if (wordLength === 1 && key.match(/[a-z]/)) {
        const index = key.charCodeAt(0) - 97; // 'a' = 97
        setCurrentIndex(index);
      } else if (key === 'ArrowRight' || key === ' ') {
        event.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % currentContent.length);
      } else if (key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + currentContent.length) % currentContent.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentContent.length, wordLength]);

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
    
    if (savedWordLength) setWordLength(parseInt(savedWordLength));
    if (savedLetterCase) setLetterCase(savedLetterCase);
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('phonicsWordLength', wordLength.toString());
    localStorage.setItem('phonicsLetterCase', letterCase);
    localStorage.setItem('phonicsDarkMode', isDarkMode.toString());
  }, [wordLength, letterCase, isDarkMode]);

  const formatDisplayText = (text) => {
    switch(letterCase) {
      case 'uppercase': return text.toUpperCase();
      case 'both': return text.toLowerCase() + ' ' + text.toUpperCase();
      default: return text.toLowerCase();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-amber-50'}`}>
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
        style={{ minHeight: 'calc(100vh - 120px)' }}
      >
        <LetterDisplay 
          text={formatDisplayText(currentItem)}
          isDarkMode={isDarkMode}
          showConfetti={showConfetti}
        />
      </div>

      {/* Confetti button */}
      <ConfettiButton 
        onCelebrate={() => setShowConfetti(true)}
        onComplete={() => setShowConfetti(false)}
        isDarkMode={isDarkMode}
      />

      {/* Instructions */}
      <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Click left/right sides to navigate • Press letter keys for direct access • Use arrow keys or spacebar</p>
      </div>
    </div>
  );
};

export default PhonicsApp;
