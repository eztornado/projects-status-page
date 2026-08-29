from datetime import timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..database import get_session
from ..models import CheckResult, Service, utcnow
from ..services_config import display_url, load_services
from ..schemas import (
    HistoryPoint,
    LatencyPoint,
    ServiceStatus,
    StatusResponse,
    TimelinePoint,
)

router = APIRouter(prefix="/api")


@router.get("/status", response_model=StatusResponse)
async def get_status(session: AsyncSession = Depends(get_session)) -> StatusResponse:
    services = (
        await session.execute(select(Service).order_by(Service.sort_order))
    ).scalars().all()

    now = utcnow()
    since_24h = now - timedelta(hours=24)
    since_7d = now - timedelta(days=7)
    urls = {cfg.id: display_url(cfg) for cfg in load_services()}

    result: list[ServiceStatus] = []
    for svc in services:
        rows = (
            await session.execute(
                select(CheckResult)
                .where(CheckResult.service_id == svc.id, CheckResult.ts >= since_7d)
                .order_by(CheckResult.ts)
            )
        ).scalars().all()

        last = rows[-1] if rows else None
        h24 = [r for r in rows if r.ts >= since_24h]

        def aware(dt):
            return dt.replace(tzinfo=timezone.utc)

        def uptime_pct(rs) -> float | None:
            if not rs:
                return None
            return round(100.0 * sum(1 for r in rs if r.up) / len(rs), 2)

        result.append(
            ServiceStatus(
                id=svc.id,
                name=svc.name,
                type=svc.type,
                url=urls.get(svc.id, ""),
                status="up" if (last and last.up) else "down",
                latency_ms=last.latency_ms if last and last.up else None,
                last_checked=aware(last.ts) if last else None,
                uptime_24h=uptime_pct(h24),
                uptime_7d=uptime_pct(rows),
                timeline=[
                    TimelinePoint(ts=aware(r.ts), up=r.up, latency_ms=r.latency_ms)
                    for r in h24
                ],
                latency_series=[
                    LatencyPoint(ts=aware(r.ts), latency_ms=r.latency_ms)
                    for r in rows
                    if r.up and r.latency_ms is not None
                ],
            )
        )

    overall = "operational" if all(s.status == "up" for s in result) else "outage"
    return StatusResponse(
        overall=overall, generated_at=now.replace(tzinfo=timezone.utc), services=result
    )


@router.get("/history/{service_id}", response_model=list[HistoryPoint])
async def get_history(
    service_id: str,
    days: int = Query(default=7, ge=1, le=settings.retention_days),
    session: AsyncSession = Depends(get_session),
) -> list[HistoryPoint]:
    if not await session.get(Service, service_id):
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    since = utcnow() - timedelta(days=days)
    rows = (
        await session.execute(
            select(CheckResult)
            .where(CheckResult.service_id == service_id, CheckResult.ts >= since)
            .order_by(CheckResult.ts)
        )
    ).scalars().all()
    return [
        HistoryPoint(
            ts=r.ts.replace(tzinfo=timezone.utc),
            up=r.up,
            latency_ms=r.latency_ms,
            error=r.error,
        )
        for r in rows
    ]


@router.get("/health")
async def health() -> dict[str, bool]:
    return {"ok": True}
