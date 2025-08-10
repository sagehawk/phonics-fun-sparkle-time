import { useState, useEffect, useCallback } from 'react';
import enData from '../data/en.json';

type Rhymes = Record<string, Record<string, string[]>>;

const rhymeData: Rhymes = {
  en: enData.rhymes,
};

export const useRhymes = (language: string, wordLength: number) => {
  const [rhymeGroup, setRhymeGroup] = useState<string[]>([]);
  const [rhymeIndex, setRhymeIndex] = useState(0);

  const rhymesForLanguage = rhymeData[language];
  const rhymesForLength = rhymesForLanguage ? rhymesForLanguage[wordLength] : undefined;

  const findRhymeGroup = useCallback((word: string) => {
    if (!rhymesForLength) return;

    for (const key in rhymesForLength) {
      if (rhymesForLength[key].includes(word)) {
        setRhymeGroup(rhymesForLength[key]);
        setRhymeIndex(rhymesForLength[key].indexOf(word));
        return;
      }
    }
  }, [language, wordLength]);

  const getNextRhyme = useCallback(() => {
    if (rhymeGroup.length === 0) return null;
    const nextIndex = (rhymeIndex + 1) % rhymeGroup.length;
    setRhymeIndex(nextIndex);
    return rhymeGroup[nextIndex];
  }, [rhymeGroup, rhymeIndex]);

  return { findRhymeGroup, getNextRhyme, rhymeGroups: rhymesForLength };
};
