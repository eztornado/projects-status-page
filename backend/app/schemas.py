from datetime import datetime

from pydantic import BaseModel


class TimelinePoint(BaseModel):
    ts: datetime
    up: bool
    latency_ms: int | None


class LatencyPoint(BaseModel):
    ts: datetime
    latency_ms: int


class ServiceStatus(BaseModel):
    id: str
    name: str
    type: str
    status: str  # "up" | "down"
    latency_ms: int | None
    last_checked: datetime | None
    uptime_24h: float | None
    uptime_7d: float | None
    timeline: list[TimelinePoint]
    latency_series: list[LatencyPoint]


class StatusResponse(BaseModel):
    overall: str  # "operational" | "outage"
    generated_at: datetime
    services: list[ServiceStatus]


class HistoryPoint(BaseModel):
    ts: datetime
    up: bool
    latency_ms: int | None
    error: str | None
