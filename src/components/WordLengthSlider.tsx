
import React from 'react';

interface WordLengthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const WordLengthSlider: React.FC<WordLengthSliderProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3, 4].map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`
            px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200
            ${value === level 
              ? 'bg-gray-800 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
