import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import LanguageSelector from './LanguageSelector';
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
  const [language, setLanguage] = useState('en');
  const [showTransliteration, setShowTransliteration] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const touchHandledRef = useRef(false);
  const touchCountRef = useRef(0);

  // Content arrays for English and Arabic only
  const getContent = () => {
    const content: Record<string, Record<number, string[]>> = {
      en: {
        1: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        2: ['AT', 'BE', 'GO', 'HE', 'IF', 'IN', 'IS', 'IT', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'WE'],
        3: ['AND', 'ARE', 'BUT', 'CAN', 'CAR', 'CAT', 'DOG', 'EAT', 'FOR', 'GET', 'GOT', 'HAD', 'HAS', 'HER', 'HIM', 'HIS', 'HOW', 'ITS', 'LET', 'MAY', 'NEW', 'NOT', 'NOW', 'OLD', 'ONE', 'OUR', 'OUT', 'PUT', 'RUN', 'SAY', 'SHE', 'THE', 'TOO', 'TWO', 'USE', 'WAS', 'WAY', 'WHO', 'WIN', 'YES', 'YET', 'YOU'],
        4: ['BACK', 'BEEN', 'CALL', 'CAME', 'COME', 'EACH', 'FIND', 'GIVE', 'GOOD', 'HAVE', 'HERE', 'JUST', 'KNOW', 'LAST', 'LEFT', 'LIFE', 'LIKE', 'LIVE', 'LOOK', 'MADE', 'MAKE', 'MANY', 'MORE', 'MOST', 'MOVE', 'MUCH', 'NAME', 'NEED', 'NEXT', 'ONLY', 'OVER', 'PART', 'PLAY', 'RIGHT', 'SAID', 'SAME', 'SEEM', 'SHOW', 'SOME', 'TAKE', 'TELL', 'THAN', 'THAT', 'THEM', 'THEY', 'THIS', 'TIME', 'VERY', 'WANT', 'WELL', 'WENT', 'WERE', 'WHAT', 'WHEN', 'WILL', 'WITH', 'WORD', 'WORK', 'YEAR', 'YOUR']
      },
      ar: {
        1: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
        2: ['أم', 'أب', 'بر', 'جد', 'دم', 'رز', 'سم', 'شم', 'طب', 'فم', 'قد', 'كل', 'لا', 'ما', 'نم', 'هو', 'يد'],
        3: ['أسد', 'بحر', 'تين', 'جمل', 'حصان', 'خبز', 'دجاج', 'ذئب', 'رمان', 'زهر', 'سمك', 'شجر', 'صقر', 'ضفدع', 'طير', 'ظبي', 'عين', 'غزال', 'فيل', 'قطة', 'كتاب', 'لحم', 'ماء', 'نار', 'هلال', 'وردة', 'يوم'],
        4: ['أرنب', 'برتقال', 'تفاح', 'جزر', 'حليب', 'خروف', 'ديك', 'ذهب', 'رقبة', 'زيتون', 'سلحفاة', 'شمس', 'صباح', 'ضوء', 'طاولة', 'ظل', 'عصفور', 'غابة', 'فراشة', 'قمر', 'كرسي', 'ليمون', 'مفتاح', 'نجمة', 'هدية', 'وجه', 'يد']
      }
    };
    
    return content[language]?.[wordLength] || content.en[wordLength];
  };

  // Arabic transliteration mapping
  const getArabicTransliteration = (arabicText: string): string => {
    const transliterationMap: Record<string, string> = {
      'ا': 'alif', 'ب': 'ba', 'ت': 'ta', 'ث': 'tha', 'ج': 'jeem', 'ح': 'ha', 'خ': 'kha',
      'د': 'dal', 'ذ': 'thal', 'ر': 'ra', 'ز': 'zay', 'س': 'seen', 'ش': 'sheen',
      'ص': 'sad', 'ض': 'dad', 'ط': 'ta', 'ظ': 'za', 'ع': 'ayn', 'غ': 'ghayn',
      'ف': 'fa', 'ق': 'qaf', 'ك': 'kaf', 'ل': 'lam', 'م': 'meem', 'ن': 'noon',
      'ه': 'ha', 'و': 'waw', 'ي': 'ya'
    };

    if (wordLength === 1) {
      return transliterationMap[arabicText] || arabicText;
    } else {
      // For words, transliterate each letter
      return arabicText.split('').map(char => transliterationMap[char] || char).join('-');
    }
  };

  const currentContent = getContent();

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
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(console.log);
    }
  };

  const getMaxZoom = () => {
    const baseMax = 8;
    const lengthFactor = wordLength === 1 ? 1 : wordLength === 2 ? 0.8 : wordLength === 3 ? 0.6 : 0.4;
    const transliterationFactor = (language === 'ar' && showTransliteration) ? 0.7 : 1;
    return baseMax * lengthFactor * transliterationFactor;
  };

  const currentDisplayText = caseMode === 'uppercase' 
    ? currentContent[currentIndex] 
    : currentContent[currentIndex].toLowerCase();

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
    if (!showImage) {
      await searchImage(currentContent[currentIndex]);
    }
    setShowImage(!showImage);
  };

  const handleLetterAreaClick = (side: 'left' | 'right' | 'center') => {
    if (side === 'center') {
      if (language === 'ar') {
        setShowTransliteration(!showTransliteration);
      } else {
        toggleCaseMode();
      }
    }
  };

  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 1) {
      return;
    }
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    const x = clientX - rect.left;
    const width = rect.width;
    
    const clickedElement = e.target as HTMLElement;
    if (clickedElement.closest('button') || clickedElement.closest('[data-letter-display]')) {
      return;
    }
    
    setShowImage(false);
    
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
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
    } flex flex-col select-none overflow-hidden`}>
      
      {/* Header */}
      <div className={`px-4 py-3 border-b transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800/90' : 'border-gray-200 bg-white/90'
      } backdrop-blur-sm flex-shrink-0 shadow-sm`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Simple Phonics
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <WordLengthSlider 
              value={wordLength} 
              onChange={setWordLength} 
              isDarkMode={isDarkMode} 
            />
            
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              isDarkMode={isDarkMode}
            />
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
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
            language={language}
            showTransliteration={showTransliteration}
            transliteration={language === 'ar' ? getArabicTransliteration(currentContent[currentIndex]) : ''}
          />
        </div>

        <audio ref={audioRef} src="data:audio/wav;base64,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" />
      </div>
    </div>
  );
};

export default PhonicsApp;
