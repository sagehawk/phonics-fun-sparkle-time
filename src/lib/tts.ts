// src/lib/tts.ts

const phonicsMap: { [key: string]: string } = {
  'a': 'a',
  'b': 'buh',
  'c': 'kuh',
  'd': 'duh',
  'e': 'e',
  'f': 'f',
  'g': 'guh',
  'h': 'huh',
  'i': 'i',
  'j': 'juh',
  'k': 'kuh',
  'l': 'luh',
  'm': 'm', // mmm sound
  'n': 'n', // nnn sound
  'o': 'o',
  'p': 'puh',
  'q': 'kwuh',
  'r': 'r', // rrr sound
  's': 's', // sss sound
  't': 'tuh',
  'u': 'u',
  'v': 'vuh',
  'w': 'wuh',
  'x': 'ks',
  'y': 'yuh',
  'z': 'zuh',
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
};

let femaleVoice: SpeechSynthesisVoice | null = null;

const loadVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  femaleVoice = voices.find(voice => voice.name.includes('Female') && voice.lang.startsWith('en')) || voices.find(voice => voice.lang.startsWith('en-US') && voice.name.includes('Female')) || voices.find(voice => voice.lang.startsWith('en')) || null;
};

// The voices are loaded asynchronously.
if ('speechSynthesis' in window) {
  if (window.speechSynthesis.getVoices().length > 0) {
    loadVoices();
  } else {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export const speak = (letter: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const lowerLetter = letter.toLowerCase();
    const textToSpeak = phonicsMap[lowerLetter] || lowerLetter;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Text-to-Speech is not supported in this browser.');
  }
};
