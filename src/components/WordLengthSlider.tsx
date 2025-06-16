
import React from 'react';

const WordLengthSlider = ({ value, onChange, isDarkMode }) => {
  const labels = ['Letters', '2-Letter Words', '3-Letter Words', '4-Letter Words'];
  
  return (
    <div className="flex flex-col items-center gap-2">
      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Learning Mode
      </label>
      
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${value === level 
                ? (isDarkMode 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-blue-500 text-white shadow-lg'
                  )
                : (isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  )
              }
            `}
          >
            {level}
          </button>
        ))}
      </div>
      
      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {labels[value - 1]}
      </span>
    </div>
  );
};

export default WordLengthSlider;
