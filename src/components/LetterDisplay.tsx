
import React, { useEffect, useState } from 'react';

const LetterDisplay = ({ text, isDarkMode, showConfetti }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="relative flex items-center justify-center">
      <div 
        className={`
          text-8xl md:text-9xl lg:text-[12rem] font-bold
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}
          ${isDarkMode ? 'text-white' : 'text-gray-800'}
          font-nunito tracking-wider
        `}
        style={{ 
          fontFamily: '"Nunito", system-ui, -apple-system, sans-serif',
          textShadow: isDarkMode 
            ? '0 4px 20px rgba(255, 255, 255, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {text}
      </div>
      
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Confetti particles will be rendered here */}
        </div>
      )}
    </div>
  );
};

export default LetterDisplay;
