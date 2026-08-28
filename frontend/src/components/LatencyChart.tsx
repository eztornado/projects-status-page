import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ServiceStatus } from "../api/client";

const COLORS = [
  "#3fb950",
  "#58a6ff",
  "#d29922",
  "#bc8cff",
  "#39c5cf",
  "#f778ba",
  "#ffa657",
  "#8b949e",
];

interface Row {
  [key: string]: number | null;
}

function buildRows(services: ServiceStatus[]): { rows: Row[]; keys: string[] } {
  const byTs = new Map<string, Row>();
  services.forEach((svc) => {
    for (const point of svc.latency_series) {
      const key = point.ts;
      if (!byTs.has(key)) byTs.set(key, {});
      byTs.get(key)![svc.id] = point.latency_ms;
    }
  });
  const rows = [...byTs.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ts, row]) => ({ ts: new Date(ts).getTime(), ...row }));
  const keys = services.map((s) => s.id);
  return { rows, keys };
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LatencyChart({ services }: { services: ServiceStatus[] }) {
  const { rows, keys } = buildRows(services);
  if (rows.length === 0) {
    return (
      <div className="chart-box">
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Sin datos de latencia todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="chart-box">
      <div className="legend">
        {services.map((svc, i) => (
          <span className="legend-item" key={svc.id}>
            <span
              className="legend-swatch"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {svc.name}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#21262d" vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={fmtTime}
            stroke="#8b949e"
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            stroke="#8b949e"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit=" ms"
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(ts) => fmtTime(ts as number)}
            formatter={(value) => (value == null ? "—" : `${value} ms`)}
          />
          {keys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.08}
              strokeWidth={1.5}
              connectNulls
              dot={false}
              name={services.find((s) => s.id === key)?.name ?? key}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
