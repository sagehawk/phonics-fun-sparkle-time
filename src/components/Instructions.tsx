import React from 'react';
import { Lightbulb } from 'lucide-react';

const Instructions: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-4 h-4" />
        <span>
          Click the word to see rhymes. Click the sides of the screen to change words.
        </span>
      </div>
    </div>
  );
};

export default Instructions;
