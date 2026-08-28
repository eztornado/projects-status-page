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
    await cleanup_old_checks()
    logger.info(
        "Ronda de checks completada: %d servicios", len(configured)
    )


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
