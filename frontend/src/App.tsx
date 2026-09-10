import { useEffect } from "react";
import { useStatus } from "./hooks/useStatus";
import { ServiceCard } from "./components/ServiceCard";
import { LatencyChart } from "./components/LatencyChart";

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "menos de un minuto";
  if (mins === 1) return "hace 1 minuto";
  return `hace ${mins} minutos`;
}

export default function App() {
  const { data, error, loading, refresh } = useStatus();

  const allUp = data?.overall === "operational";
  const downCount = data?.services.filter((s) => s.status === "down").length ?? 0;

  useEffect(() => {
    if (data) document.title = `Estado del Sistema · ${data.project_name}`;
  }, [data]);

  return (
    <div className="container">
      {error && <div className="error-box">No se pudo contactar con el servidor: {error}</div>}

      <header className="banner">
        <div>
          <div className="banner-main">
            <span
              className={`dot ${allUp ? "green" : "red"} pulse`}
              aria-hidden
            />
            <span>
              {data ? (
                <>
                  {data.project_name} ·{" "}
                  {loading
                    ? "Comprobando…"
                    : allUp
                      ? "Todos los sistemas operativos"
                      : `Interrupción parcial — ${downCount} servicio${downCount !== 1 ? "s" : ""} caído${downCount !== 1 ? "s" : ""}`}
                </>
              ) : (
                "Comprobando estado…"
              )}
            </span>
          </div>
          <div className="banner-sub">
            Última comprobación:{" "}
            {timeAgo(data?.services.find((s) => s.last_checked)?.last_checked ?? null)}
          </div>
        </div>
        <button className="refresh-btn" onClick={refresh}>
          Actualizar
        </button>
      </header>

      <h2 className="section-title">Servicios</h2>
      <div className="grid">
        {data?.services.map((svc) => (
          <ServiceCard key={svc.id} service={svc} />
        ))}
      </div>

      <h2 className="section-title">Latencia · últimos 7 días</h2>
      {data && <LatencyChart services={data.services} />}

      <footer className="footer">
        <span>{data ? `${data.project_name} — Estado del sistema` : "Estado del sistema"}</span>
        <span>Comprobaciones automáticas cada 5 minutos · Histórico de 7 días</span>
      </footer>
    </div>
  );
}
