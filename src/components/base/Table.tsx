import React from 'react';
import { cn } from '../../utils/classNames';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onSort?: (key: keyof T | string, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  rowClassName?: string | ((item: T) => string);
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function Table<T>({
  data,
  columns,
  loading = false,
  onSort,
  sortKey,
  sortDirection,
  className,
  rowClassName,
  onRowClick,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const handleSort = (key: keyof T | string) => {
    if (!onSort || !columns.find(col => col.key === key)?.sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderSortIcon = (key: keyof T | string) => {
    if (!columns.find(col => col.key === key)?.sortable) return null;

    return (
      <span className="ml-2 inline-flex flex-col">
        <svg
          className={cn(
            'w-2 h-2 -mb-0.5',
            sortKey === key && sortDirection === 'asc' ? 'text-primary-500' : 'text-gray-400'
          )}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 5l8 8H4z" />
        </svg>
        <svg
          className={cn(
            'w-2 h-2',
            sortKey === key && sortDirection === 'desc' ? 'text-primary-500' : 'text-gray-400'
          )}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 19l-8-8h16z" />
        </svg>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200 dark:divide-gray-700', className)}>
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map(column => (
              <th
                key={column.key.toString()}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap',
                  column.sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200'
                )}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                onClick={() => handleSort(column.key)}
              >
                <span className="flex items-center">
                  {column.title}
                  {renderSortIcon(column.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {data.length === 0 ? (
            <tr>
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                  typeof rowClassName === 'function' ? rowClassName(item) : rowClassName,
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map(column => (
                  <td
                    key={column.key.toString()}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {column.render
                      ? column.render(
                          typeof column.key === 'string'
                            ? (item as any)[column.key]
                            : item[column.key],
                          item
                        )
                      : typeof column.key === 'string'
                        ? (item as any)[column.key]
                        : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
