import type { TimelinePoint } from "../api/client";

const MAX_SEGMENTS = 40;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UptimeBar({ timeline }: { timeline: TimelinePoint[] }) {
  if (timeline.length === 0) {
    return (
      <div className="uptime-bar" title="Sin datos todavía">
        <div className="uptime-seg empty" />
      </div>
    );
  }

  // Muestrea la tira a ~MAX_SEGMENTS segmentos (promedia bloques de checks).
  const step = Math.ceil(timeline.length / MAX_SEGMENTS);
  const segments: { up: boolean; label: string }[] = [];
  for (let i = 0; i < timeline.length; i += step) {
    const block = timeline.slice(i, i + step);
    const up = block.every((p) => p.up);
    const last = block[block.length - 1];
    segments.push({
      up,
      label: up
        ? `${formatTime(last.ts)} · ${last.latency_ms ?? "?"} ms`
        : `Caído · ${formatTime(last.ts)}`,
    });
  }

  return (
    <div className="uptime-bar">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`uptime-seg ${seg.up ? "up" : "down"}`}
          title={seg.label}
        />
      ))}
    </div>
  );
}
