import { AnimationControls, useAnimation } from 'framer-motion';
import { useCallback, useState, useEffect } from 'react';



interface UseAnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
}

interface AnimationState {
  isAnimating: boolean;
  controls: AnimationControls;
}

export const useCustomAnimation = ({
  duration = 0.3,
  delay = 0,
  ease = 'easeInOut'
}: UseAnimationOptions = {}) => {
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = useCallback(
    async (variants: { [key: string]: any }, options?: { [key: string]: any }) => {
      setIsAnimating(true);
      await controls.start({
        ...variants,
        transition: {
          duration,
          delay,
          ease,
          ...options?.transition
        }
      });
      setIsAnimating(false);
    },
    [controls, duration, delay, ease]
  );

  const fadeIn = useCallback(
    (options?: { [key: string]: any }) =>
      animate(
        {
          opacity: 1,
          y: 0,
          scale: 1
        },
        options
      ),
    [animate]
  );

  const fadeOut = useCallback(
    (options?: { [key: string]: any }) =>
      animate(
        {
          opacity: 0,
          y: 20,
          scale: 0.95
        },
        options
      ),
    [animate]
  );

  const slideIn = useCallback(
    (direction: 'left' | 'right' | 'top' | 'bottom', options?: { [key: string]: any }) => {
      const variants = {
        left: { x: 0, opacity: 1 },
        right: { x: 0, opacity: 1 },
        top: { y: 0, opacity: 1 },
        bottom: { y: 0, opacity: 1 }
      };

      const initial = {
        left: { x: -100, opacity: 0 },
        right: { x: 100, opacity: 0 },
        top: { y: -100, opacity: 0 },
        bottom: { y: 100, opacity: 0 }
      };

      controls.set(initial[direction]);
      return animate(variants[direction], options);
    },
    [controls, animate]
  );

  const pulse = useCallback(
    (options?: { [key: string]: any }) =>
      animate(
        {
          scale: [1, 1.05, 1],
          transition: {
            duration: 0.4,
            times: [0, 0.5, 1],
            ...options?.transition
          }
        },
        options
      ),
    [animate]
  );

  const shake = useCallback(
    (options?: { [key: string]: any }) =>
      animate(
        {
          x: [0, -10, 10, -5, 5, 0],
          transition: {
            duration: 0.5,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            ...options?.transition
          }
        },
        options
      ),
    [animate]
  );

  const bounce = useCallback(
    (options?: { [key: string]: any }) =>
      animate(
        {
          y: [0, -20, 0],
          transition: {
            duration: 0.6,
            times: [0, 0.5, 1],
            ...options?.transition
          }
        },
        options
      ),
    [animate]
  );

  return {
    controls,
    isAnimating,
    fadeIn,
    fadeOut,
    slideIn,
    pulse,
    shake,
    bounce,
    animate
  };
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
  transition: { duration: 0.3 }
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.3 }
};

export const useOddsAnimation = (value: number): AnimationControls => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: 1.1,
      transition: { duration: 0.15 }
    }).then(() => {
      controls.start({
        scale: 1,
        transition: { duration: 0.15 }
      });
    });
  }, [value, controls]);

  return controls;
};

export const bounceIn = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20
  }
};

export const staggerChildren = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}; 