from ..services_config import HttpService, MysqlService, ServiceConfig
from .base import CheckOutcome
from .http import check_http
from .mysql import check_mysql


async def run_check(service: ServiceConfig) -> CheckOutcome:
    if isinstance(service, HttpService):
        return await check_http(service)
    if isinstance(service, MysqlService):
        return await check_mysql(service)
    raise ValueError(f"Tipo de servicio no soportado: {type(service).__name__}")
