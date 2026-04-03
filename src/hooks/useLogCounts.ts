import { useEffect, useRef, useState } from 'react';
import Logger from '@services/logger';

/**
 * Custom hook for tracking log counts and updating neural oscillation chart
 * Encapsulates log subscription and interval management
 */
export function useLogCounts() {
  const [logCounts, setLogCounts] = useState<number[]>(Array(60).fill(0));
  const totalLogsRef = useRef(0);
  const lastSnapshotRef = useRef(0);

  // Subscribe to Logger events for chart
  useEffect(() => {
    const unsubscribe = Logger.subscribe((_message: string) => {
      totalLogsRef.current += 1;
    });

    return () => unsubscribe();
  }, []);

  // Every 5 seconds: update chart with log count delta
  useEffect(() => {
    const intervalId = setInterval(() => {
      const delta = totalLogsRef.current - lastSnapshotRef.current;
      lastSnapshotRef.current = totalLogsRef.current;
      setLogCounts(prev => [...prev.slice(1), delta]);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return logCounts;
}
