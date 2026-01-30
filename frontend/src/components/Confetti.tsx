'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export function useConfetti() {
  const fire = useCallback(() => {
    // Coral-themed confetti colors
    const colors = ['#FF6B6B', '#FF8787', '#FFA8A8', '#ffffff', '#FFD4D4'];

    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    // Side bursts for more drama
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 300);
  }, []);

  return { fire };
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const { fire } = useConfetti();

  useEffect(() => {
    if (trigger) {
      fire();
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [trigger, fire, onComplete]);

  return null;
}

// Preset confetti animations
export const confettiPresets = {
  // Celebration burst
  celebration: () => {
    const colors = ['#FF6B6B', '#FF8787', '#FFA8A8', '#ffffff'];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  },

  // Subtle sparkle
  sparkle: () => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#FF6B6B', '#ffffff'],
      scalar: 0.8,
    });
  },

  // Fireworks
  fireworks: () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FF6B6B', '#FF8787', '#FFA8A8'];

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 30,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors,
      });
    }, 250);
  },

  // Task complete animation
  taskComplete: () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff'],
    });
  },
};
