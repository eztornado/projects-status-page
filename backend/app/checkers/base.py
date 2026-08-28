from dataclasses import dataclass


@dataclass
class CheckOutcome:
    up: bool
    latency_ms: int | None = None
    error: str | None = None
