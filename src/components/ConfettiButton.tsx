
import React, { useEffect } from 'react';
import { Star } from 'lucide-react';

const ConfettiButton = ({ onCelebrate, onComplete, isDarkMode }) => {
  const triggerConfetti = () => {
    onCelebrate();
    
    // Create confetti particles immediately
    createConfetti();
    
    // Clear confetti after animation
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const createConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(confettiContainer);

    // Create 60 confetti pieces for more impact
    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 6;
      const startX = Math.random() * window.innerWidth;
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5; // Reduced delay for immediate impact

      confetti.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        top: -10px;
        left: ${startX}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: confetti-fall ${duration}s linear ${delay}s forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;

      confettiContainer.appendChild(confetti);
    }

    // Add CSS animation if not already present
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(${window.innerHeight + 10}px) rotate(720deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Clean up
    setTimeout(() => {
      if (confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    }, 5000);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    triggerConfetti();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    triggerConfetti();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`
        fixed bottom-6 right-6 w-16 h-16 rounded-full
        flex items-center justify-center
        transform transition-all duration-200
        hover:scale-110 active:scale-95
        shadow-lg hover:shadow-xl
        ${isDarkMode 
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
        }
      `}
      aria-label="Celebrate!"
    >
      <Star size={24} fill="currentColor" />
    </button>
  );
};

export default ConfettiButton;
