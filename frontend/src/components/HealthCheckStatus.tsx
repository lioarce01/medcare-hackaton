import { useState, useEffect } from 'react';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HealthCheckStatusProps {
  showDebug?: boolean;
}

export function HealthCheckStatus({ showDebug = false }: HealthCheckStatusProps) {
  const { getStatus, manualPing, start, stop } = useHealthCheck({ autoStart: false });
  const [status, setStatus] = useState(getStatus());
  const [lastPing, setLastPing] = useState<string>('Never');
  const [isPinging, setIsPinging] = useState(false);

  // Update status every second for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [getStatus]);

  const handleManualPing = async () => {
    setIsPinging(true);
    try {
      const success = await manualPing();
      if (success) {
        setLastPing(new Date().toLocaleTimeString());
      }
    } finally {
      setIsPinging(false);
    }
  };

  const handleStart = () => {
    start(5); // Start with 5-minute intervals
    setStatus(getStatus());
  };

  const handleStop = () => {
    stop();
    setStatus(getStatus());
  };

  // Only show in development or when explicitly requested
  if (!showDebug && import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Health Check Status
          <Badge variant={status.isRunning ? "default" : "secondary"}>
            {status.isRunning ? "Running" : "Stopped"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className="text-sm font-medium">
              {status.isRunning ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Interval:</span>
            <span className="text-sm font-medium">
              {status.intervalMinutes} minutes
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Ping:</span>
            <span className="text-sm font-medium">{lastPing}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleManualPing}
            disabled={isPinging}
            variant="outline"
          >
            {isPinging ? "Pinging..." : "Manual Ping"}
          </Button>

          {status.isRunning ? (
            <Button size="sm" onClick={handleStop} variant="destructive">
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={handleStart} variant="default">
              Start
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 