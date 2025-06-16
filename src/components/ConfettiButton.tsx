
import React from 'react';
import { Star } from 'lucide-react';

interface ConfettiButtonProps {
  onCelebrate: () => void;
  onComplete: () => void;
  isDarkMode: boolean;
  className?: string;
}

const ConfettiButton: React.FC<ConfettiButtonProps> = ({ onCelebrate, onComplete, isDarkMode, className = '' }) => {
  const triggerConfetti = () => {
    onCelebrate();
    
    // Create enhanced confetti particles that burst from center
    createConfetti();
    
    // Clear confetti after shorter, more energetic animation
    setTimeout(() => {
      onComplete();
    }, 2000); // Reduced from 3000ms
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
      z-index: 1000;
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(confettiContainer);

    // Create 100 confetti pieces for maximum impact, originating from center
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 15 + 10; // Larger pieces
      const angle = (Math.PI * 2 * i) / 100; // Distribute evenly in circle
      const velocity = Math.random() * 300 + 200; // Faster, more explosive
      const duration = Math.random() * 1.5 + 1; // Shorter duration

      confetti.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        top: 0;
        left: 0;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: confetti-burst ${duration}s ease-out forwards;
        transform: rotate(${Math.random() * 360}deg);
        --angle: ${angle}rad;
        --velocity: ${velocity}px;
      `;

      confettiContainer.appendChild(confetti);
    }

    // Add enhanced CSS animation for burst effect
    if (!document.getElementById('confetti-burst-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-burst-styles';
      style.textContent = `
        @keyframes confetti-burst {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: 
              translate(
                calc(cos(var(--angle)) * var(--velocity)), 
                calc(sin(var(--angle)) * var(--velocity) + 400px)
              ) 
              rotate(720deg) 
              scale(0.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Clean up faster
    setTimeout(() => {
      if (confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    }, 3000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerConfetti();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    triggerConfetti();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
        ${className}
      `}
      aria-label="Celebrate!"
    >
      <Star size={24} fill="currentColor" />
    </button>
  );
};

export default ConfettiButton;
