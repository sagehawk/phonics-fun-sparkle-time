
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
  isClickable = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [text]);

  // Wheel zoom functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.5 : 0.5; // Increased sensitivity
      const newZoom = Math.max(0.5, Math.min(8, zoomLevel + delta));
      onZoomChange(newZoom);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoomLevel, onZoomChange]);

  // Enhanced touch pinch-to-zoom functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
        const newZoom = Math.max(0.5, Math.min(8, zoomLevel * scale));
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
  }, [zoomLevel, onZoomChange]);

  const handleLetterClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onLetterAreaClick) return;
    
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    const x = clientX - rect.left;
    const width = rect.width;
    
    // Divide the letter into three click zones with better boundaries
    if (x < width * 0.3) {
      onLetterAreaClick('left');
    } else if (x > width * 0.7) {
      onLetterAreaClick('right');
    } else {
      onLetterAreaClick('center');
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full h-full touch-none">
      {/* Confetti animation - behind the letter with lower z-index */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="confetti-burst"></div>
        </div>
      )}

      {/* Main letter/word display - higher z-index than confetti */}
      <div 
        className={`
          text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}
          ${isDarkMode ? 'text-white' : 'text-gray-800'}
          font-nunito tracking-wider
          flex items-center justify-center
          ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer'}
          select-none relative
          touch-manipulation
        `}
        style={{ 
          fontFamily: '"Nunito", system-ui, -apple-system, sans-serif',
          textShadow: isDarkMode 
            ? '0 4px 20px rgba(255, 255, 255, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          transform: `scale(${zoomLevel})`, // Don't modify zoom during confetti
          transformOrigin: 'center',
          lineHeight: '0.8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '1em',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 10 // Higher than confetti
        }}
        onClick={handleLetterClick}
        onTouchEnd={handleLetterClick}
      >
        {text}
      </div>

      {/* Image hint - slides in from side/top without overlay */}
      {showImage && imageData && (
        <>
          {/* Desktop: slide in from right */}
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

          {/* Mobile: slide in from top */}
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
