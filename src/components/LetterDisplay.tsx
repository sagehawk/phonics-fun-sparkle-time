import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { letterColors } from '../lib/colors';

interface LetterDisplayProps {
  text: string;
  showConfetti: boolean;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  showImage: boolean;
  imageData: { url: string; searchTerm: string } | null;
  onLetterAreaClick?: () => void;
  onLetterLongPress?: () => void;
  isClickable?: boolean;
  maxZoom?: number;
  language: string;
  showTransliteration?: boolean;
  transliteration?: string;
}

const LetterDisplay: React.FC<LetterDisplayProps> = ({ 
  text, 
  showConfetti, 
  zoomLevel, 
  onZoomChange, 
  showImage, 
  imageData,
  onLetterAreaClick,
  onLetterLongPress,
  isClickable = false,
  maxZoom = 8,
  language,
  showTransliteration = false,
  transliteration = ''
}) => {
  const { isDarkMode } = useTheme();
  
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  

  // Improved zoom functionality that works anywhere on screen
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.5 : 0.5;
      const newZoom = Math.max(0.5, Math.min(maxZoom, zoomLevel + delta));
      onZoomChange(newZoom);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [zoomLevel, onZoomChange, maxZoom]);

  // Improved touch pinch-to-zoom functionality that works anywhere
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        lastTouchDistance.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistance.current) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const scale = distance / lastTouchDistance.current;
        const newZoom = Math.max(0.5, Math.min(maxZoom, zoomLevel * scale));
        onZoomChange(newZoom);
        lastTouchDistance.current = distance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastTouchDistance.current = null;
      }
    };

    // Attach to document instead of just the container for better coverage
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomLevel, onZoomChange, maxZoom]);

  const handleTouchStart = () => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      if (onLetterLongPress) {
        onLetterLongPress();
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Only trigger click if it wasn't a long press
    if (!isLongPress && onLetterAreaClick) {
      e.preventDefault();
      e.stopPropagation();
      onLetterAreaClick();
    }
    
    // Reset long press state after a short delay
    setTimeout(() => setIsLongPress(false), 100);
  };

  const handleMouseDown = () => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      if (onLetterLongPress) {
        onLetterLongPress();
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Only trigger click if it wasn't a long press
    if (!isLongPress && onLetterAreaClick) {
      e.preventDefault();
      e.stopPropagation();
      onLetterAreaClick();
    }
    
    // Reset long press state after a short delay
    setTimeout(() => setIsLongPress(false), 100);
  };

  const getFontFamily = () => {
    switch (language) {
      case 'ar':
        return '"Amiri", "Noto Sans Arabic", "Arabic UI Display", system-ui, sans-serif';
      case 'fa':
        return '"Vazirmatn", "Noto Sans Arabic", system-ui, sans-serif';
      default:
        return '"Nunito", system-ui, -apple-system, sans-serif';
    }
  };

  const getTextDirection = () => {
    return (language === 'ar' || language === 'fa') ? 'rtl' : 'ltr';
  };

  // Safe transliteration handling with null checks
  const getTransliterationParts = () => {
    if (!transliteration || !text || text.length === 1) {
      return transliteration ? [transliteration] : [];
    }
    
    const parts = transliteration.split('-');
    // For Arabic/Farsi multi-letter words, reverse the transliteration order to match RTL text
    return (language === 'ar' || language === 'fa') ? parts.reverse() : parts;
  };

  const transliterationParts = getTransliterationParts();

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full h-full touch-none">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: -1 }}>
          <div className="confetti-burst" style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}></div>
        </div>
      )}

      {/* Main scaling container - positioned higher */}
      <div 
        className="flex flex-col items-center justify-center"
        style={{
          transform: `scale(${Math.min(zoomLevel, maxZoom)})`,
          transformOrigin: 'center center',
          marginTop: window.innerWidth <= 768 ? '-10vh' : '-8vh'
        }}
      >
        {/* Wrapper for word and transliteration to scale together */}
        <div className="flex flex-col items-center justify-center">
          {/* Main letter/word display */}
          <div 
            data-letter-display
            className={`
              text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold
              transition-all duration-300 ease-out
              ${isDarkMode ? 'text-white' : 'text-gray-800'}
              tracking-wider
              flex items-center justify-center
              ${isClickable ? 'cursor-pointer' : 'cursor-pointer'}
              select-none relative
              touch-manipulation
              letter-display-no-highlight
            `}
            style={{ 
              fontFamily: getFontFamily(),
              direction: getTextDirection(),
              textShadow: isDarkMode 
                ? '0 4px 20px rgba(255, 255, 255, 0.1)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              lineHeight: (language === 'ar' || language === 'fa') ? '1.2' : '0.8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '1em',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
              zIndex: 1
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {text && text.length === 1 ? (
              <span style={{ color: letterColors[text.toUpperCase()] }}>{text}</span>
            ) : text ? (
              // For multi-letter Arabic/Farsi words, display as connected text
              (language === 'ar' || language === 'fa') ? (
                <span className="arabic-connected">{text}</span>
              ) : (
                // For English, keep individual letters
                <div
                  className="flex justify-center"
                  style={{
                    direction: getTextDirection(),
                    gap: '0.1em'
                  }}
                >
                  <div className="w-40 text-right">
                    <span
                      className="relative"
                      style={{ color: letterColors[text.charAt(0).toUpperCase()] }}
                    >
                      {text.charAt(0)}
                    </span>
                  </div>
                  <span>{text.substring(1)}</span>
                </div>
              )
            ) : null}
          </div>

          {/* Transliteration display - positioned relative to the word above */}
          {(language === 'ar' || language === 'fa') && showTransliteration && transliteration && (
            <div 
              className={`
                text-lg md:text-xl lg:text-2xl font-medium
                ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                text-center
              `}
              style={{
                fontFamily: '"Nunito", system-ui, -apple-system, sans-serif',
                marginTop: '0.3em',
                fontSize: '0.4em', // Relative to parent font size
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              {text && text.length === 1 ? (
                transliteration
              ) : transliterationParts.length > 0 ? (
                <div className="flex justify-center gap-4" style={{ direction: 'rtl' }}>
                  {transliterationParts.map((part, index) => (
                    <span key={index} className="text-center">
                      {part || ''}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Image hint */}
      {showImage && imageData && (
        <>
          <div className={`
            hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2
            transition-transform duration-500 ease-out
            ${showImage ? 'translate-x-0' : 'translate-x-full'}
          `} style={{ zIndex: 20 }}>
            <div className="bg-white rounded-lg p-4 shadow-xl mr-8">
              <img
                src={imageData.url}
                alt={imageData.searchTerm}
                className="w-64 h-64 object-cover rounded"
              />
              <p className="text-center mt-2 text-gray-800 font-medium text-lg">
                {imageData.searchTerm}
              </p>
            </div>
          </div>

          <div className={`
            block md:hidden absolute top-0 left-1/2 transform -translate-x-1/2
            transition-transform duration-500 ease-out
            ${showImage ? 'translate-y-0' : '-translate-y-full'}
          `} style={{ zIndex: 20 }}>
            <div className="bg-white rounded-lg p-4 shadow-xl mt-8">
              <img
                src={imageData.url}
                alt={imageData.searchTerm}
                className="w-48 h-48 object-cover rounded"
              />
              <p className="text-center mt-2 text-gray-800 font-medium text-base">
                {imageData.searchTerm}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LetterDisplay;