
import React from 'react';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English' }
  ];

  const currentIndex = languages.findIndex(lang => lang.code === value);
  
  const toggleLanguage = () => {
    const nextIndex = (currentIndex + 1) % languages.length;
    onChange(languages[nextIndex].code);
  };

  const currentLang = languages[currentIndex] || languages[0];

  return (
    <button
      onClick={toggleLanguage}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
        bg-stone-200 text-stone-800 hover:bg-stone-300
      `}
      aria-label={`Switch to next language`}
    >
      <span className="text-lg">{currentLang.flag}</span>
      <span className="hidden sm:inline">{currentLang.name}</span>
    </button>
  );
};

export default LanguageSelector;
