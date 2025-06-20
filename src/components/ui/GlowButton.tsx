import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({ children, className = '', ...props }) => (
  <button
    className={`ultimate-btn px-6 py-3 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default GlowButton;
