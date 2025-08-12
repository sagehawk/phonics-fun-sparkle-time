
import { useState, useEffect } from 'react';
import enData from '../data/en.json';
import arData from '../data/ar.json';
import faData from '../data/fa.json';

type LanguageData = {
  letters: string[] | string;
  words: Record<string, string[]>;
  transliteration?: Record<string, string>;
  rhymes?: Record<string, Record<string, string[]>>;
};

const languageData: Record<string, LanguageData> = {
  en: enData,
  ar: arData,
  fa: faData,
};

export const usePhonics = () => {
  const [language, setLanguage] = useState('en');
  const [wordLength, setWordLength] = useState(1);
  const [content, setContent] = useState<string[]>([]);
  const [transliterationMap, setTransliterationMap] = useState<Record<string, string> | undefined>(undefined);

  useEffect(() => {
    const data = languageData[language];
    if (data) {
      let newContent: string[] = [];
      if (wordLength === 1) {
        const letters = data.letters || [];
        newContent = Array.isArray(letters) ? letters : letters.split('');
      } else {
        const rhymesForLength = data.rhymes?.[wordLength];
        if (rhymesForLength) {
          newContent = Object.values(rhymesForLength).flat();
        } else {
          newContent = data.words?.[wordLength] || [];
        }
      }
      setContent(newContent);
      setTransliterationMap(data.transliteration);
    }
  }, [language, wordLength]);

  const getTransliteration = (text: string) => {
    if (!transliterationMap || !text) return '';
    if (text.length === 1) {
      return transliterationMap[text] || text;
    } else {
      return text.split('').map(char => transliterationMap[char] || char).join('-');
    }
  };

  return {
    language,
    setLanguage,
    wordLength,
    setWordLength,
    content,
    getTransliteration,
  };
};
