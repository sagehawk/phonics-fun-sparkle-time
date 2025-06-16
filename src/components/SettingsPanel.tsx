
import React, { useState } from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';

const SettingsPanel = ({ letterCase, onLetterCaseChange, isDarkMode, audioEnabled, onAudioToggle, capsLockActive }) => {
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
          absolute right-0 top-12 p-4 rounded-lg shadow-lg border z-10 min-w-56
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="space-y-4">
            {/* Audio Controls */}
            <div>
              <label className={`text-sm font-medium block mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Audio Feedback
              </label>
              <button
                onClick={() => onAudioToggle(!audioEnabled)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  audioEnabled
                    ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
                }`}
              >
                {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-sm">
                  {audioEnabled ? 'Sound On' : 'Sound Off'}
                </span>
              </button>
            </div>

            {/* Letter Case */}
            <div>
              <label className={`text-sm font-medium block mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Letter Case
                {capsLockActive && (
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    isDarkMode ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    CAPS LOCK ON
                  </span>
                )}
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
                      disabled={capsLockActive}
                      className={`text-blue-500 ${capsLockActive ? 'opacity-50' : ''}`}
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    } ${capsLockActive ? 'opacity-50' : ''}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              {capsLockActive && (
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Letter case is controlled by Caps Lock
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
