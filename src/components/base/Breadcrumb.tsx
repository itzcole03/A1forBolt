import React from 'react';
import { cn } from '../../utils/classNames';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
  itemClassName?: string;
  separatorClassName?: string;
}

const DefaultSeparator = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
);

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <DefaultSeparator />,
  className,
  maxItems = 0,
  itemClassName,
  separatorClassName,
}) => {
  const renderItems = maxItems > 0 ? truncateItems(items, maxItems) : items;

  function truncateItems(items: BreadcrumbItem[], maxItems: number) {
    if (items.length <= maxItems) return items;

    const start = items.slice(0, Math.ceil(maxItems / 2));
    const end = items.slice(-Math.floor(maxItems / 2));

    return [...start, { label: '...', href: undefined }, ...end];
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="flex items-center space-x-2">
        {renderItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className={cn('mx-2 flex items-center', separatorClassName)}>
                {separator}
              </span>
            )}
            {item.href ? (
              <a
                className={cn(
                  'flex items-center text-sm font-medium',
                  index === renderItems.length - 1
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                  itemClassName
                )}
                href={item.href}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </a>
            ) : (
              <span
                className={cn(
                  'flex items-center text-sm font-medium',
                  index === renderItems.length - 1
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400',
                  itemClassName
                )}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
