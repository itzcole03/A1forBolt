import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { cn } from '../../utils/classNames';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: SelectOption['value'];
  onChange: (value: SelectOption['value']) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  disabled,
  placeholder = 'Select an option',
  className,
  loading,
}) => {
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <Listbox disabled={disabled || loading} value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full rounded-lg border bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : (
              <span className={!selectedOption ? 'text-gray-500' : undefined}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            )}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                aria-hidden="true"
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  fillRule="evenodd"
                />
              </svg>
            </span>
          </Listbox.Button>

          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {options.map(option => (
                <Listbox.Option
                  key={option.value}
                  className={({ active, disabled }) =>
                    cn(
                      'cursor-default select-none relative py-2 pl-3 pr-9',
                      active ? 'text-white bg-primary-500' : 'text-gray-900 dark:text-gray-100',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                  disabled={option.disabled}
                  value={option.value}
                >
                  {({ active, selected }) => (
                    <>
                      <span className={cn('block truncate', selected && 'font-semibold')}>
                        {option.label}
                      </span>
                      {selected && (
                        <span
                          className={cn(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active ? 'text-white' : 'text-primary-500'
                          )}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              clipRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              fillRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}
    </div>
  );
};
