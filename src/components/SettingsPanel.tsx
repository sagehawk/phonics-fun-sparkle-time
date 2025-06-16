
import React, { useState } from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';

interface SettingsPanelProps {
  caseMode: 'lowercase' | 'uppercase';
  isDarkMode: boolean;
  audioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  caseMode, 
  isDarkMode, 
  audioEnabled, 
  onAudioToggle 
}) => {
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

            {/* Current Case Mode Display */}
            <div>
              <label className={`text-sm font-medium block mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Current Case Mode
              </label>
              <div className={`px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                <span className="text-sm font-medium">
                  {caseMode === 'lowercase' ? 'Lowercase (a)' : 'Uppercase (A)'}
                </span>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Press Shift to toggle case mode
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
