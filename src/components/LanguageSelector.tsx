
import React from 'react';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  isDarkMode: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, isDarkMode }) => {
  const toggleLanguage = () => {
    onChange(value === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
        ${isDarkMode 
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }
      `}
      aria-label={`Switch to ${value === 'en' ? 'Arabic' : 'English'}`}
    >
      <span className="text-lg">{value === 'en' ? '🇺🇸' : '🇸🇦'}</span>
      <span className="hidden sm:inline">{value === 'en' ? 'English' : 'العربية'}</span>
    </button>
  );
};

export default LanguageSelector;
