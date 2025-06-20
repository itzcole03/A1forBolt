import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, rounded = 'rounded-xl' }) => (
    <div
        className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${rounded} ${className}`}
        style={{ width, height }}
        aria-busy="true"
        aria-live="polite"
    />
);

export default Skeleton;
