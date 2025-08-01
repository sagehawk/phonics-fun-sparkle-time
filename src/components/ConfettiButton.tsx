
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ConfettiButtonProps {
  onCelebrate: () => void;
  onComplete: () => void;
  isDarkMode: boolean;
  className?: string;
}

const ConfettiButton: React.FC<ConfettiButtonProps> = ({ onCelebrate, onComplete, isDarkMode, className = '' }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  
  const triggerConfetti = () => {
    if (isTriggering) return;
    
    setIsTriggering(true);
    onCelebrate();
    
    createConfetti();
    
    setTimeout(() => {
      setIsTriggering(false);
    }, 1000);
  };

  const createConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 1;
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(confettiContainer);

    // Create 100 confetti pieces distributed evenly in all directions
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 6;
      
      // Distribute evenly in full 360 degrees
      const angle = (Math.PI * 2 * i) / 100;
      const velocity = Math.random() * 300 + 200;
      const duration = Math.random() * 1.5 + 1;
      
      // Calculate x and y velocities for even distribution
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      confetti.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        top: 0;
        left: 0;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: confetti-fall ${duration}s ease-out forwards;
        transform: rotate(${Math.random() * 360}deg);
        --vx: ${vx}px;
        --vy: ${vy}px;
      `;

      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      if (confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    }, 3000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerConfetti();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerConfetti();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      disabled={isTriggering}
      className={`
        w-16 h-16 rounded-full
        flex items-center justify-center
        transform transition-all duration-200
        hover:scale-110 active:scale-95
        shadow-lg hover:shadow-xl
        ${isDarkMode 
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
        }
        ${isTriggering ? 'opacity-75' : ''}
        ${className}
      `}
      aria-label="Celebrate!"
    >
      <Star size={24} fill="currentColor" />
    </button>
  );
};

export default ConfettiButton;
