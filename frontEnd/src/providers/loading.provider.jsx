import { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingContext } from '../contexts/loading.context';

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const activeRequestsRef = useRef(0);
  const startRef = useRef(null);
  const timersRef = useRef(new Map());
  const timerIdCounterRef = useRef(0);

  const startLoading = useCallback(() => {
    activeRequestsRef.current += 1;
    startRef.current = Date.now();
    setLoading(true);
  }, []);

  const stopLoading = useCallback((minTime = 250) => {
    if (activeRequestsRef.current <= 0) {
      return;
    }

    const elapsed = Date.now() - (startRef.current || Date.now());
    const remaining = Math.max(0, minTime - elapsed);

    const timerId = ++timerIdCounterRef.current;

    const timer = setTimeout(() => {
      activeRequestsRef.current -= 1;

      if (activeRequestsRef.current <= 0) {
        activeRequestsRef.current = 0;
        setLoading(false);
      }

      timersRef.current.delete(timerId);
    }, remaining);

    timersRef.current.set(timerId, timer);
  }, []);

  useEffect(() => {
    const timersToCleanup = timersRef.current;
    
    return () => {
      timersToCleanup.forEach((timer) => clearTimeout(timer));
      timersToCleanup.clear();
      activeRequestsRef.current = 0;
    };
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        loading,
        startLoading,
        stopLoading,
      }}
    >
      {children}

      {loading && (
        <div className="global-loading-overlay">
          <div className="spinner" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}