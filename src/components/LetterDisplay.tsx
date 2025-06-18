
import React, { useEffect, useState, useRef } from 'react';

interface LetterDisplayProps {
  text: string;
  isDarkMode: boolean;
  showConfetti: boolean;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  showImage: boolean;
  imageData: { url: string; searchTerm: string } | null;
  onLetterAreaClick?: (side: 'left' | 'right' | 'center') => void;
  isClickable?: boolean;
  maxZoom?: number;
  language: string;
  showTransliteration?: boolean;
  transliteration?: string;
}

const LetterDisplay: React.FC<LetterDisplayProps> = ({ 
  text, 
  isDarkMode, 
  showConfetti, 
  zoomLevel, 
  onZoomChange, 
  showImage, 
  imageData,
  onLetterAreaClick,
  isClickable = false,
  maxZoom = 8,
  language,
  showTransliteration = false,
  transliteration = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [text]);

  // Zoom functionality that only affects the letter
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

  // Touch pinch-to-zoom functionality
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

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomLevel, onZoomChange, maxZoom]);

  const handleLetterClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onLetterAreaClick) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    onLetterAreaClick('center');
  };

  const getFontFamily = () => {
    switch (language) {
      case 'ar':
        return '"Noto Sans Arabic", "Arabic UI Display", system-ui, sans-serif';
      default:
        return '"Nunito", system-ui, -apple-system, sans-serif';
    }
  };

  const getTextDirection = () => {
    return language === 'ar' ? 'rtl' : 'ltr';
  };

  // Split transliteration for multi-letter words and reverse order for Arabic
  const getTransliterationParts = () => {
    if (!transliteration || text.length === 1) {
      return [transliteration];
    }
    
    const parts = transliteration.split('-');
    // For Arabic multi-letter words, reverse the transliteration order to match RTL text
    return language === 'ar' ? parts.reverse() : parts;
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

      {/* Main letter/word display container - this is the key fix */}
      <div 
        className="flex flex-col items-center justify-center"
        style={{
          transform: `scale(${Math.min(zoomLevel, maxZoom)})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Main letter/word display */}
        <div 
          data-letter-display
          className={`
            text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold
            transition-all duration-300 ease-out
            ${isAnimating ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}
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
            lineHeight: language === 'ar' ? '1.2' : '0.8',
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
          onTouchEnd={handleLetterClick}
          onClick={handleLetterClick}
        >
          {text.length === 1 ? (
            text
          ) : (
            <div className="flex" style={{ direction: getTextDirection(), gap: '0.1em' }}>
              {text.split('').map((char, index) => (
                <span key={index} className="relative">
                  {char}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Transliteration display for Arabic - now properly positioned relative to the scaled parent */}
        {language === 'ar' && showTransliteration && transliteration && (
          <div 
            className={`
              text-lg md:text-xl lg:text-2xl font-medium
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              text-center
            `}
            style={{
              fontFamily: '"Nunito", system-ui, -apple-system, sans-serif',
              marginTop: '0.3em', // Using em units so it scales with the parent
              fontSize: '0.4em' // Relative to the parent's font size
            }}
          >
            {text.length === 1 ? (
              transliteration
            ) : (
              <div className="flex justify-center gap-4" style={{ direction: 'rtl' }}>
                {transliterationParts.map((part, index) => (
                  <span key={index} className="text-center">
                    {part}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image hint - slides in from side/top without overlay */}
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
