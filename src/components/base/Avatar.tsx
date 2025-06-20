import React from 'react';
import { cn } from '../../utils/classNames';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  shape?: 'circle' | 'square';
  fallback?: string;
  bordered?: boolean;
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-14 w-14 text-xl',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  status,
  shape = 'circle',
  fallback,
  bordered = false,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackInitials = () => {
    if (!fallback) return '';
    return fallback
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden',
          sizes[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          bordered && 'ring-2 ring-white dark:ring-gray-800',
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            alt={alt}
            className="h-full w-full object-cover"
            src={src}
            onError={handleImageError}
          />
        ) : (
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {getFallbackInitials()}
          </span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<{
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}> = ({ avatars, max = 4, size = 'md', className }) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          className="ring-2 ring-white dark:ring-gray-800"
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium ring-2 ring-white dark:ring-gray-800 rounded-full',
            sizes[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
