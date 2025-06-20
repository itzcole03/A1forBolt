import React, { ReactNode } from 'react';

interface GlassCardProps {
  className?: string;
  children: ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ className = '', children }) => (
  <div className={`glass-morphism rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

export default GlassCard;
