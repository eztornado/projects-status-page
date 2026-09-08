import type { ServiceStatus } from "../api/client";
import { UptimeBar } from "./UptimeBar";

export function ServiceCard({ service }: { service: ServiceStatus }) {
  const up = service.status === "up";
  return (
    <div className="card">
      <div className="card-top">
        <span className="card-name">{service.name}</span>
        <span className={`pill ${up ? "up" : "down"}`}>
          {up ? "Operativo" : "Caído"}
        </span>
      </div>
      {service.url && (
        <div className="card-url" title={service.url}>
          {service.url}
        </div>
      )}
      {service.description && <div className="card-desc">{service.description}</div>}
      <div className="latency">
        {up && service.latency_ms != null ? (
          <>
            Respuesta: <strong>{service.latency_ms} ms</strong>
          </>
        ) : (
          <span>{up ? "—" : "Sin respuesta"}</span>
        )}
      </div>
      <UptimeBar timeline={service.timeline} />
      <div className="card-foot">
        <span>Últimas 24 h</span>
        <span className="pct">
          {service.uptime_7d != null ? `${service.uptime_7d.toFixed(2)} % · 7 días` : "—"}
        </span>
      </div>
      {service.docs_url && (
        <a
          className="card-docs"
          href={service.docs_url}
          target="_blank"
          rel="noreferrer noopener"
        >
          Documentación ↗
        </a>
      )}
    </div>
  );
}
