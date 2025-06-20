import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Example usage:
// const [searchTerm, setSearchTerm] = useState('');
// const debouncedSearchTerm = useDebounce(searchTerm, 500);
//
// useEffect(() => {
//   // This effect will only run after the user stops typing for 500ms
//   if (debouncedSearchTerm) {
//     searchAPI(debouncedSearchTerm);
//   }
// }, [debouncedSearchTerm]);
