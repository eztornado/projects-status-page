import type { Service } from '../config/services';

export interface ServiceStatus {
  name: string;
  url: string;
  status: 'up' | 'down';
  latency: number;
  lastCheck: Date;
  error?: string;
}

export async function checkService(service: Service): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(service.url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    const endTime = Date.now();
    const latency = endTime - startTime;

    return {
      name: service.name,
      url: service.url,
      status: response.ok ? 'up' : 'down',
      latency,
      lastCheck: new Date(),
    };
  } catch (error) {
    const endTime = Date.now();
    const latency = endTime - startTime;

    return {
      name: service.name,
      url: service.url,
      status: 'down',
      latency,
      lastCheck: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkAllServices(services: Service[]): Promise<ServiceStatus[]> {
  const checks = services.map(service => checkService(service));
  return Promise.all(checks);
}