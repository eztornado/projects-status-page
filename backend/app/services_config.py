from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field


class HttpService(BaseModel):
    id: str
    name: str
    type: Literal["http"]
    url: str
    verify_tls: bool = True
    docs_url: str | None = None
    description: str | None = None


class MysqlService(BaseModel):
    id: str
    name: str
    type: Literal["mysql"]
    host: str
    port: int = 3306
    docs_url: str | None = None
    description: str | None = None
    credentials_env: dict[str, str] = Field(default_factory=dict)


ServiceConfig = HttpService | MysqlService


def display_url(cfg: ServiceConfig) -> str:
    if isinstance(cfg, HttpService):
        return cfg.url
    return f"mysql://{cfg.host}:{cfg.port}"


class ServicesFile(BaseModel):
    services: list[ServiceConfig]


@lru_cache
def load_services(path: Path | None = None) -> list[ServiceConfig]:
    if path is None:
        path = Path(__file__).resolve().parent.parent / "services.yaml"
    with open(path) as f:
        data = yaml.safe_load(f)
    return ServicesFile.model_validate(data).services
