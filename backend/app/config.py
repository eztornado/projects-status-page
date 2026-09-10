from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Nombre del proyecto mostrado en la página (para reutilizar el proyecto tal cual)
    app_name: str = "Status Page"

    # Fichero de servicios a monitorizar (por defecto, backend/services.yaml del
    # repo). Los servicios también pueden definirse con variables SVC_* (ver
    # services_config), que tienen prioridad.
    services_file: Path | None = None

    port: int = 8000
    data_dir: Path = Path("/data")
    check_interval_minutes: int = 5
    retention_days: int = 7
    check_timeout_seconds: float = 10.0

    mysql_user: str = ""
    mysql_password: str = ""
    mysql_database: str = ""

    # Variables de Telegram
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    telegram_enabled: bool = False

    # Webhook de Coolify para notificaciones
    coolify_webhook_url: str = ""


settings = Settings()
