export interface TimelinePoint {
  ts: string;
  up: boolean;
  latency_ms: number | null;
}

export interface LatencyPoint {
  ts: string;
  latency_ms: number;
}

export interface ServiceStatus {
  id: string;
  name: string;
  type: string;
  url: string;
  docs_url: string | null;
  description: string | null;
  status: "up" | "down";
  latency_ms: number | null;
  last_checked: string | null;
  uptime_24h: number | null;
  uptime_7d: number | null;
  timeline: TimelinePoint[];
  latency_series: LatencyPoint[];
}

export interface StatusResponse {
  overall: "operational" | "outage";
  project_name: string;
  generated_at: string;
  services: ServiceStatus[];
}

export async function fetchStatus(signal?: AbortSignal): Promise<StatusResponse> {
  const res = await fetch("/api/status", { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status} al consultar /api/status`);
  return res.json();
}
