import asyncio
import logging
from datetime import timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete, select

from .config import settings
from .database import SessionLocal
from .models import CheckResult, Service, utcnow
from .services_config import load_services
from .checkers import run_check
from .telegram import send_telegram_notification, telegram_config

logger = logging.getLogger(__name__)


async def sync_services() -> None:
    """Upsert services from services.yaml; delete removed ones with their checks."""
    configured = load_services()
    async with SessionLocal() as session:
        existing = {
            s.id: s for s in (await session.execute(select(Service))).scalars()
        }
        wanted = {s.id for s in configured}
        for order, cfg in enumerate(configured):
            if cfg.id in existing:
                svc = existing[cfg.id]
                svc.name, svc.type, svc.sort_order = cfg.name, cfg.type, order
            else:
                session.add(
                    Service(id=cfg.id, name=cfg.name, type=cfg.type, sort_order=order)
                )
        for sid in set(existing) - wanted:
            await session.execute(
                delete(CheckResult).where(CheckResult.service_id == sid)
            )
            await session.delete(existing[sid])
        await session.commit()


async def cleanup_old_checks() -> None:
    cutoff = utcnow() - timedelta(days=settings.retention_days)
    async with SessionLocal() as session:
        await session.execute(delete(CheckResult).where(CheckResult.ts < cutoff))
        await session.commit()


async def run_all_checks() -> None:
    configured = load_services()
    outcomes = await asyncio.gather(
        *(run_check(cfg) for cfg in configured), return_exceptions=True
    )
    now = utcnow()
    async with SessionLocal() as session:
        for cfg, outcome in zip(configured, outcomes):
            if isinstance(outcome, BaseException):
                logger.error("Check %s crashed: %r", cfg.id, outcome)
                session.add(
                    CheckResult(service_id=cfg.id, ts=now, up=False, error=str(outcome)[:200])
                )
                continue
            session.add(
                CheckResult(
                    service_id=cfg.id,
                    ts=now,
                    up=outcome.up,
                    latency_ms=outcome.latency_ms,
                    error=outcome.error,
                )
            )
        await session.commit()

        # Enviar notificaciones por Telegram
        await send_telegram_notifications(session, configured, outcomes, now)

    await cleanup_old_checks()
    logger.info("Ronda de checks completada: %d servicios", len(configured))


async def send_telegram_notifications(session, configured, outcomes, now):
    """Enviar notificaciones de Telegram solo cuando hay cambios de estado."""
    # Buscar el resultado anterior para cada servicio (máximo 2 rondas atrás)
    from sqlalchemy import and_
    rows = await session.execute(select(CheckResult).order_by(CheckResult.service_id, CheckResult.ts.asc()))
    results_list = list(rows.scalars())

    # Construir diccionario por servicio_id -> lista de resultados
    service_results = {}
    for row in results_list:
        sid = str(row.service_id)
        if sid not in service_results:
            service_results[sid] = []
        service_results[sid].append(row)

    for cfg, outcome in zip(configured, outcomes):
        sid = str(cfg.id)
        if sid not in service_results:
            continue

        # Ordenar por tiempo (reciente primero)
        service_results[sid].sort(key=lambda r: r.ts, reverse=True)

        # Último y penúltimo resultado
        try:
            last = service_results[sid][0]
            prev = service_results[sid][1] if len(service_results[sid]) > 1 else None
        except IndexError:
            continue

        last_up = last.up if hasattr(last, 'up') else None
        prev_up = prev.up if prev and hasattr(prev, 'up') else None

        if last_up != prev_up and telegram_config.telegram_enabled and telegram_config.telegram_bot_token:
            if last.up:
                status = "se ha reactivado"
            else:
                status = "ha caído"

            msg = f"""⚠️ <b>{cfg.name}</b> {status}

• <b>Estado:</b> {'ONLINE' if last.up else 'OFFLINE'}
• <b>Tiempo:</b> {last.ts.strftime('%Y-%m-%d %H:%M:%S')}
• <b>URL:</b> {cfg.url if hasattr(cfg, 'url') else cfg.host if hasattr(cfg, 'host') else 'N/A'}
"""
            webhook_url = getattr(settings, 'coolify_webhook_url', None)
            await send_telegram_notification(msg, last, session, webhook_url)


def start_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_all_checks,
        trigger="cron",
        minute=f"*/{settings.check_interval_minutes}",
        id="checks",
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()
    return scheduler
