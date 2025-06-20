import { keyframes } from '@mui/system';

// Fade in animation
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Slide in animation
export const slideIn = keyframes`
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Flash animation for value changes
export const flash = keyframes`
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(144, 202, 249, 0.2);
  }
  100% {
    background-color: transparent;
  }
`;

// Scale animation for important updates
export const scale = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Common animation durations
export const durations = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.5s',
};

// Common animation timing functions
export const timingFunctions = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
};
