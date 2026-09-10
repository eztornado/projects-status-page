import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field

from .config import settings


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


# Servicios definibles por variables de entorno SVC_<ID>_<CAMPO>, pensados para
# despliegues de marca blanca (p. ej. la UI de variables de Coolify):
#
#   SVC_WEB_NAME=Web
#   SVC_WEB_URL=https://web.cliente.com
#   SVC_API_NAME=API
#   SVC_API_URL=https://api.cliente.com
#   SVC_API_DOCS_URL=https://api.cliente.com/docs
#   SVC_BD_TYPE=mysql
#   SVC_BD_HOST=db.interno
#   SVC_BD_PORT=3306
#
# Si existe alguno, definen la lista completa y tienen prioridad sobre el
# fichero. Los servicios se ordenan alfabéticamente por id.
_ENV_PREFIX = "SVC_"
_ENV_FIELDS = (  # sufijos, del más largo al más corto
    "VERIFY_TLS",
    "DESCRIPTION",
    "DOCS_URL",
    "TYPE",
    "NAME",
    "HOST",
    "PORT",
    "URL",
)


def _services_from_env() -> list[ServiceConfig] | None:
    raw: dict[str, dict[str, str]] = {}
    for key, value in os.environ.items():
        if not key.startswith(_ENV_PREFIX):
            continue
        rest = key[len(_ENV_PREFIX):]
        for field in _ENV_FIELDS:
            if rest.endswith(f"_{field}"):
                sid = rest[: -len(field) - 1].lower()
                if sid:
                    raw.setdefault(sid, {})[field.lower()] = value
                break
    if not raw:
        return None
    services: list[ServiceConfig] = []
    for sid in sorted(raw):
        f = raw[sid]
        if f.get("type") == "mysql":
            services.append(
                MysqlService(
                    id=sid,
                    type="mysql",
                    name=f.get("name", sid),
                    host=f["host"],
                    port=int(f.get("port", 3306)),
                    docs_url=f.get("docs_url"),
                    description=f.get("description"),
                )
            )
        else:
            services.append(
                HttpService(
                    id=sid,
                    type="http",
                    name=f.get("name", sid),
                    url=f["url"],
                    verify_tls=f.get("verify_tls", "true").lower()
                    not in {"false", "0", "no"},
                    docs_url=f.get("docs_url"),
                    description=f.get("description"),
                )
            )
    return services


@lru_cache
def load_services(path: Path | None = None) -> list[ServiceConfig]:
    env_services = _services_from_env()
    if env_services is not None:
        return env_services
    if path is None:
        path = settings.services_file or (
            Path(__file__).resolve().parent.parent / "services.yaml"
        )
    with open(path) as f:
        data = yaml.safe_load(f)
    return ServicesFile.model_validate(data).services
