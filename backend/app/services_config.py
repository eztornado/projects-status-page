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
    description: str | None = None


class MysqlService(BaseModel):
    id: str
    name: str
    type: Literal["mysql"]
    host: str
    port: int = 3306
    description: str | None = None
    credentials_env: dict[str, str] = Field(default_factory=dict)


ServiceConfig = HttpService | MysqlService


class ServicesFile(BaseModel):
    services: list[ServiceConfig]


@lru_cache
def load_services(path: Path | None = None) -> list[ServiceConfig]:
    if path is None:
        path = Path(__file__).resolve().parent.parent / "services.yaml"
    with open(path) as f:
        data = yaml.safe_load(f)
    return ServicesFile.model_validate(data).services
