
import React from 'react';

interface WordLengthSliderProps {
  value: number;
  onChange: (value: number) => void;
  isDarkMode: boolean;
}

const WordLengthSlider: React.FC<WordLengthSliderProps> = ({ value, onChange, isDarkMode }) => {
  const labels = ['Letters', '2-Letter Words', '3-Letter Words', '4-Letter Words'];
  
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`
            px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
            ${value === level 
              ? (isDarkMode 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-orange-500 text-white shadow-lg'
                )
              : (isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
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
