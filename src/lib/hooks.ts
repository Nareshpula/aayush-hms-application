import { useState, useEffect, useRef, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export function useCache<T>(key: string, initialValue: T | null = null) {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000;

  const get = useCallback((cacheKey: string = key): T | null => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      cacheRef.current.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, [key, CACHE_DURATION]);

  const set = useCallback((data: T, cacheKey: string = key) => {
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, [key]);

  const clear = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return { get, set, clear };
}
