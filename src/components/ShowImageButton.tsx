import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ShowImageButtonProps {
  onClick: () => void;
}

const ShowImageButton: React.FC<ShowImageButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-full flex items-center justify-center transform transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-400 to-purple-500 text-white"
      aria-label="Show Image"
    >
      <Lightbulb size={24} fill="currentColor" />
    </button>
  );
};

export default ShowImageButton;