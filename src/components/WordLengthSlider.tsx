
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface WordLengthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const WordLengthSlider: React.FC<WordLengthSliderProps> = ({ value, onChange }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3, 4].map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`
            px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
            ${value === level 
              ? (isDarkMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-800 text-white shadow-lg'
                )
              : (isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                )
            }
          `}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

export default WordLengthSlider;
