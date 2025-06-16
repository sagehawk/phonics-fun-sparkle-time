
import React, { useEffect, useState, useRef } from 'react';

const LetterDisplay = ({ text, isDarkMode, showConfetti, zoomLevel, onZoomChange, showImage, imageQuery }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [text]);

  // Touch pinch-to-zoom functionality
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
        const newZoom = Math.max(0.5, Math.min(5, zoomLevel * scale)); // Increased max zoom to 5
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
      <div 
        className={`
          text-8xl md:text-9xl lg:text-[12rem] font-bold
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}
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
          // Improved centering for letters with descenders
          lineHeight: '0.8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '1em'
        }}
      >
        {text}
      </div>
      
      {/* Image overlay */}
      {showImage && (
        <div className={`
          absolute inset-0 flex items-center justify-center
          bg-black bg-opacity-50 z-10
          transition-opacity duration-300
          ${showImage ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="bg-white rounded-lg p-4 max-w-sm max-h-sm shadow-xl">
            <img
              src={`https://source.unsplash.com/400x400/?${encodeURIComponent(imageQuery)}`}
              alt={imageQuery}
              className="w-full h-full object-cover rounded"
              style={{ maxWidth: '300px', maxHeight: '300px' }}
            />
            <p className="text-center mt-2 text-gray-800 font-medium text-lg">
              {imageQuery}
            </p>
          </div>
        </div>
      )}
      
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Confetti particles will be rendered here */}
        </div>
      )}
    </div>
  );
};

export default LetterDisplay;
