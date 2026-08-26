import { useState, useEffect } from 'react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'up' | 'down';
  latency: number;
  lastCheck: string;
  error?: string;
}

interface ServiceHistory {
  [key: string]: number[];
}

interface ApiResponse {
  success: boolean;
  timestamp: string;
  services?: ServiceStatus[];
  error?: string;
}

const HISTORY_SIZE = 20;

export function useServiceMonitor() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [history, setHistory] = useState<ServiceHistory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data: ApiResponse = await response.json();

      if (data.success && data.services) {
        setServices(data.services);

        // Update history
        setHistory(prevHistory => {
          const newHistory = { ...prevHistory };

          data.services.forEach(service => {
            const serviceName = service.name;
            const currentHistory = newHistory[serviceName] || [];

            // Add current latency and keep only last HISTORY_SIZE entries
            newHistory[serviceName] = [...currentHistory, service.latency].slice(-HISTORY_SIZE);
          });

          return newHistory;
        });

        setError(null);
      } else {
        setError(data.error || 'Error fetching service status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Poll every 10 seconds
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    services,
    history,
    loading,
    error,
    refetch: fetchStatus,
  };
}