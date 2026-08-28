import asyncio
import os
import time

import pymysql

from ..config import settings
from ..services_config import MysqlService
from .base import CheckOutcome


async def _tcp_connect(host: str, port: int) -> float:
    start = time.monotonic()
    _, writer = await asyncio.wait_for(
        asyncio.open_connection(host, port),
        timeout=settings.check_timeout_seconds,
    )
    writer.close()
    try:
        await writer.wait_closed()
    except Exception:
        pass
    return time.monotonic() - start


def _query_mysql(service: MysqlService, database: str) -> None:
    conn = pymysql.connect(
        host=service.host,
        port=service.port,
        user=os.environ[service.credentials_env["user"]],
        password=os.environ[service.credentials_env["password"]],
        database=database,
        connect_timeout=int(settings.check_timeout_seconds),
    )
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
    finally:
        conn.close()


async def check_mysql(service: MysqlService) -> CheckOutcome:
    start = time.monotonic()
    try:
        await asyncio.wait_for(
            _tcp_connect(service.host, service.port),
            timeout=settings.check_timeout_seconds,
        )
    except Exception as exc:
        return CheckOutcome(
            up=False,
            latency_ms=int((time.monotonic() - start) * 1000),
            error=f"TCP: {type(exc).__name__}: {str(exc)[:200]}",
        )

    env = service.credentials_env
    if not env or not all(os.environ.get(k) for k in env.values()):
        return CheckOutcome(
            up=True,
            latency_ms=int((time.monotonic() - start) * 1000),
        )

    database = ""
    if "database" in env:
        database = os.environ.get(env["database"], "")

    try:
        await asyncio.to_thread(_query_mysql, service, database)
        return CheckOutcome(
            up=True,
            latency_ms=int((time.monotonic() - start) * 1000),
        )
    except Exception as exc:
        return CheckOutcome(
            up=False,
            latency_ms=int((time.monotonic() - start) * 1000),
            error=f"MySQL: {type(exc).__name__}: {str(exc)[:200]}",
        )
