import { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// Fade in variants
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0 },
};

// Scale variants (for buttons, cards on hover)
export const scaleVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Stagger container for lists
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Stagger item for list items
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Slide in from right (RTL sidebar)
export const slideInRightVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 250,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Slide in from left (LTR sidebar)
export const slideInLeftVariants: Variants = {
  initial: {
    x: '-100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 250,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Modal/overlay variants
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
    },
  },
};

// Accordion/expand variants
export const accordionVariants: Variants = {
  initial: {
    height: 0,
    opacity: 0,
  },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.2,
      },
      opacity: {
        duration: 0.1,
      },
    },
  },
};

// Checkbox check animation
export const checkVariants: Variants = {
  initial: { pathLength: 0 },
  animate: {
    pathLength: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Swipe to delete (RTL - swipe right)
export const swipeVariants: Variants = {
  initial: { x: 0 },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 200,
    },
  },
};

// Card hover glow effect
export const glowVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 rgba(255, 107, 107, 0)',
  },
  hover: {
    boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
    transition: {
      duration: 0.2,
    },
  },
};

// Ripple effect configuration
export const rippleTransition = {
  duration: 0.6,
  ease: 'easeOut',
};

// Float animation for icons/badges
export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Pulse animation for notifications/badges
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Shake animation for errors
export const shakeVariants: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};
