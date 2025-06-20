import { useCallback } from 'react';

export const useStorage = () => {
  const clearAllCaches = useCallback(async () => {
    try {
      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB
      const databases = await window.indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise(resolve => {
              const request = window.indexedDB.deleteDatabase(db.name as string);
              request.onsuccess = () => resolve(true);
              request.onerror = () => resolve(false);
            });
          }
          return Promise.resolve();
        })
      );

      // Clear Cache API
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));

      return true;
    } catch (error) {
      console.error('Error clearing caches:', error);
      throw error;
    }
  }, []);

  return { clearAllCaches };
};
