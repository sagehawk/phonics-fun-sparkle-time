
import { useState, useCallback } from 'react';

export const useImageAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Predefined letter-to-word mapping for consistent results
  const letterToWord = {
    a: 'apple', b: 'ball', c: 'cat', d: 'dog', e: 'elephant', f: 'fish', g: 'guitar', h: 'house',
    i: 'ice cream', j: 'juice', k: 'kite', l: 'lion', m: 'moon', n: 'nest', o: 'orange', p: 'pig',
    q: 'queen', r: 'rainbow', s: 'sun', t: 'tree', u: 'umbrella', v: 'violin', w: 'water', x: 'xylophone',
    y: 'yellow', z: 'zebra'
  };

  const fetchImage = useCallback(async (query: string, isLetter: boolean = false) => {
    setIsLoading(true);
    try {
      // For letters, use the predefined word mapping
      const searchTerm = isLetter ? letterToWord[query.toLowerCase() as keyof typeof letterToWord] : query;
      
      // Use Unsplash API for high-quality, child-friendly images
      const response = await fetch(
        `https://source.unsplash.com/400x400/?${encodeURIComponent(searchTerm)}`
      );
      
      if (response.ok) {
        return {
          url: response.url,
          searchTerm: searchTerm || query
        };
      }
      throw new Error('Failed to fetch image');
    } catch (error) {
      console.warn('Image fetch failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchImage, isLoading };
};
