
import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  isDarkMode: boolean;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentLanguage = languages.find(lang => lang.code === value) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
          }
        `}
        aria-label="Select Language"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`
            absolute right-0 top-full mt-2 py-2 w-48 rounded-lg shadow-xl z-20
            ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}
          `}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors
                  ${value === lang.code 
                    ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-orange-100 text-orange-800')
                    : (isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100')
                  }
                `}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
