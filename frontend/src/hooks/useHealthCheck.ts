import { useEffect, useRef } from 'react';
import healthCheckService from '@/services/health-check';

interface UseHealthCheckOptions {
  intervalMinutes?: number;
  autoStart?: boolean;
}

/**
 * Hook to manage health check service
 * @param options - Configuration options for the health check
 */
export function useHealthCheck(options: UseHealthCheckOptions = {}) {
  const { intervalMinutes = 5, autoStart = true } = options;
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (autoStart) {
      console.log('Initializing health check service...');
      healthCheckService.start(intervalMinutes);
    }

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up health check service...');
      healthCheckService.stop();
    };
  }, [intervalMinutes, autoStart]);

  // Return service methods for manual control
  return {
    start: (minutes?: number) => healthCheckService.start(minutes || intervalMinutes),
    stop: () => healthCheckService.stop(),
    manualPing: () => healthCheckService.manualPing(),
    getStatus: () => healthCheckService.getStatus(),
  };
} 