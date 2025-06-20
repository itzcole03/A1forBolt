import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { cn } from '../../utils/classNames';
import { motion } from 'framer-motion';



export interface AccordionItem {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  variant?: 'default' | 'bordered' | 'separated';
  defaultOpen?: number[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  variant = 'default',
  defaultOpen = [],
  allowMultiple = false,
  className
}) => {
  const [openItems, setOpenItems] = React.useState<number[]>(defaultOpen);

  const handleItemClick = (index: number) => {
    if (allowMultiple) {
      setOpenItems(
        openItems.includes(index)
          ? openItems.filter((i) => i !== index)
          : [...openItems, index]
      );
    } else {
      setOpenItems(openItems.includes(index) ? [] : [index]);
    }
  };

  const variants = {
    default: {
      wrapper: 'divide-y divide-gray-200 dark:divide-gray-700',
      item: 'py-4',
      button: 'flex w-full items-center justify-between text-left text-gray-900 dark:text-gray-100',
      content: 'mt-4'
    },
    bordered: {
      wrapper: 'border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700',
      item: 'p-4',
      button: 'flex w-full items-center justify-between text-left text-gray-900 dark:text-gray-100',
      content: 'mt-4'
    },
    separated: {
      wrapper: 'space-y-2',
      item: 'border border-gray-200 dark:border-gray-700 rounded-lg p-4',
      button: 'flex w-full items-center justify-between text-left text-gray-900 dark:text-gray-100',
      content: 'mt-4'
    }
  };

  return (
    <div className={cn(variants[variant].wrapper, className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            variants[variant].item,
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Disclosure defaultOpen={defaultOpen.includes(index)}>
            {({ open }) => (
              <>
                <Disclosure.Button
                  className={cn(
                    variants[variant].button,
                    'group focus:outline-none'
                  )}
                  onClick={() => !item.disabled && handleItemClick(index)}
                  disabled={item.disabled}
                >
                  <span className="flex items-center">
                    {item.icon && (
                      <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
                        {item.icon}
                      </span>
                    )}
                    <span className="text-sm font-medium">{item.title}</span>
                  </span>
                  <motion.span
                    className="ml-6 flex h-7 items-center"
                    animate={{ rotate: open ? 180 : 0 }}
                  >
                    <svg
                      className="h-6 w-6 text-gray-400 group-hover:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.span>
                </Disclosure.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel
                    className={cn(
                      variants[variant].content,
                      'text-sm text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {item.content}
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>
      ))}
    </div>
  );
}; 