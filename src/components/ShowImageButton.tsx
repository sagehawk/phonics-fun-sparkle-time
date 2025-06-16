
import React from 'react';
import { Lightbulb } from 'lucide-react';

const ShowImageButton = ({ onShowImage, isDarkMode }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    onShowImage();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    onShowImage();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`
        fixed bottom-6 left-6 w-16 h-16 rounded-full
        flex items-center justify-center
        transform transition-all duration-200
        hover:scale-110 active:scale-95
        shadow-lg hover:shadow-xl
        ${isDarkMode 
          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white' 
          : 'bg-gradient-to-r from-blue-400 to-purple-500 text-white'
        }
      `}
      aria-label="Show Image"
    >
      <Lightbulb size={24} fill="currentColor" />
    </button>
  );
};

export default ShowImageButton;
