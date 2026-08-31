from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

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
