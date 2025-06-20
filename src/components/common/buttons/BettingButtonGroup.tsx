import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface BettingButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const BettingButtonGroup: React.FC<BettingButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  size = 'md',
  fullWidth = false,
}) => {
  const groupStyles = twMerge(
    'flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    fullWidth ? 'w-full' : '',
    size === 'sm' ? 'gap-1' : size === 'md' ? 'gap-2' : 'gap-3',
    className
  );

  return (
    <div className={groupStyles}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child, {
          className: twMerge(
            'flex-1',
            orientation === 'horizontal'
              ? 'rounded-none first:rounded-l-md last:rounded-r-md'
              : 'rounded-none first:rounded-t-md last:rounded-b-md',
            child.props.className
          ),
        });
      })}
    </div>
  );
};
