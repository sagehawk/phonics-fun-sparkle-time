import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const Instructions: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="absolute bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-4 h-4" />
        {isMobile ? (
          <span>
            Tap the word to change the first letter. Tap the sides to change the word.
          </span>
        ) : (
          <div className="flex space-x-4">
            <div>
              <strong>Arrow Keys:</strong>
              <ul className="list-disc list-inside">
                <li>Up/Down: Change first letter</li>
                <li>Left/Right: Change word</li>
              </ul>
            </div>
            <div>
              <strong>Number Keys:</strong>
              <ul className="list-disc list-inside">
                <li>1-4: Change word length</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;
