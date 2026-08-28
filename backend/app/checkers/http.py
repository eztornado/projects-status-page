import time

import httpx

from ..config import settings
from ..services_config import HttpService
from .base import CheckOutcome


async def check_http(service: HttpService) -> CheckOutcome:
    start = time.monotonic()
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=settings.check_timeout_seconds,
            verify=service.verify_tls,
        ) as client:
            resp = await client.get(service.url)
        latency_ms = int((time.monotonic() - start) * 1000)
        if 200 <= resp.status_code < 500:
            return CheckOutcome(up=True, latency_ms=latency_ms)
        return CheckOutcome(
            up=False,
            latency_ms=latency_ms,
            error=f"HTTP {resp.status_code}",
        )
    except Exception as exc:
        latency_ms = int((time.monotonic() - start) * 1000)
        return CheckOutcome(
            up=False,
            latency_ms=latency_ms,
            error=f"{type(exc).__name__}: {str(exc)[:200]}",
        )
