
import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const SettingsPanel = ({ letterCase, onLetterCaseChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className={`
          absolute right-0 top-12 p-4 rounded-lg shadow-lg border z-10 min-w-48
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="space-y-3">
            <div>
              <label className={`text-sm font-medium block mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Letter Case
              </label>
              <div className="space-y-1">
                {[
                  { value: 'lowercase', label: 'Lowercase (a)' },
                  { value: 'uppercase', label: 'Uppercase (A)' },
                  { value: 'both', label: 'Both (a A)' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={option.value}
                      checked={letterCase === option.value}
                      onChange={(e) => onLetterCaseChange(e.target.value)}
                      className="text-blue-500"
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
