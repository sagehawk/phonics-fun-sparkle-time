
import React, { useEffect, useState, useRef } from 'react';

interface LetterDisplayProps {
  text: string;
  isDarkMode: boolean;
  showConfetti: boolean;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  showImage: boolean;
  imageData: { url: string; searchTerm: string } | null;
}

const LetterDisplay: React.FC<LetterDisplayProps> = ({ 
  text, 
  isDarkMode, 
  showConfetti, 
  zoomLevel, 
  onZoomChange, 
  showImage, 
  imageData 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isJiggling, setIsJiggling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [text]);

  // Trigger jiggle animation when confetti shows
  useEffect(() => {
    if (showConfetti) {
      setIsJiggling(true);
      const timer = setTimeout(() => setIsJiggling(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Enhanced touch pinch-to-zoom functionality with increased sensitivity
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
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
        const newZoom = Math.max(0.5, Math.min(8, zoomLevel * scale)); // Increased max zoom and sensitivity
        onZoomChange(newZoom);
        lastTouchDistance.current = distance;
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomLevel, onZoomChange]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full h-full">
      {/* Main letter/word display */}
      <div 
        className={`
          text-8xl md:text-9xl lg:text-[12rem] font-bold
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}
          ${isJiggling ? 'animate-bounce' : ''}
          ${isDarkMode ? 'text-white' : 'text-gray-800'}
          font-nunito tracking-wider
          flex items-center justify-center
        `}
        style={{ 
          fontFamily: '"Nunito", system-ui, -apple-system, sans-serif',
          textShadow: isDarkMode 
            ? '0 4px 20px rgba(255, 255, 255, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
          lineHeight: '0.8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '1em'
        }}
      >
        {text}
      </div>
      
      {/* Enhanced confetti animation - originates from letter center */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="confetti-burst"></div>
        </div>
      )}

      {/* Redesigned image hint - slides in from side/top without overlay */}
      {showImage && imageData && (
        <>
          {/* Desktop: slide in from right */}
          <div className={`
            hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2
            transition-transform duration-500 ease-out z-10
            ${showImage ? 'translate-x-0' : 'translate-x-full'}
          `}>
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
            transition-transform duration-500 ease-out z-10
            ${showImage ? 'translate-y-0' : '-translate-y-full'}
          `}>
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
