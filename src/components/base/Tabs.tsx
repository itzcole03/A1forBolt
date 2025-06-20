import React from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '../../utils/classNames';
import { motion } from 'framer-motion';

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultIndex = 0,
  onChange,
  variant = 'default',
  fullWidth = false,
  className,
}) => {
  const variants = {
    default: {
      list: 'flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1',
      tab: 'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-700 dark:text-gray-200',
      selected: 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    pills: {
      list: 'flex space-x-2',
      tab: 'px-4 py-2 text-sm font-medium rounded-full text-gray-500 dark:text-gray-400',
      selected: 'bg-primary-500 text-white',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    underline: {
      list: 'flex space-x-8 border-b border-gray-200 dark:border-gray-700',
      tab: 'py-4 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent',
      selected: 'border-primary-500 text-primary-600 dark:text-primary-500',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  };

  return (
    <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
      <Tab.List className={cn(variants[variant].list, fullWidth ? 'w-full' : '', className)}>
        {items.map(item => (
          <Tab
            key={item.key}
            className={({ selected }) =>
              cn(
                variants[variant].tab,
                'relative flex items-center justify-center gap-2 focus:outline-none transition-all duration-200',
                selected
                  ? variants[variant].selected
                  : 'hover:text-gray-700 dark:hover:text-gray-200',
                item.disabled && variants[variant].disabled
              )
            }
            disabled={item.disabled}
          >
            {({ selected }) => (
              <>
                {item.icon}
                {item.label}
                {item.badge && (
                  <span
                    className={cn(
                      'ml-2 rounded-full px-2 py-0.5 text-xs font-medium',
                      selected
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {variant === 'underline' && selected && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    layoutId="underline"
                  />
                )}
              </>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {items.map(item => (
          <Tab.Panel
            key={item.key}
            className={cn(
              'rounded-xl focus:outline-none',
              'ring-white/60 ring-offset-2 ring-offset-primary-400 focus:ring-2'
            )}
          >
            {item.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};
