import asyncio
import logging
from typing import Optional

import aiohttp
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import CheckResult, Service, utcnow
from .config import settings

logger = logging.getLogger(__name__)

# Configuración de Telegram (se lee de variables de entorno)
class TelegramSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    telegram_enabled: bool = False

telegram_config = TelegramSettings()


async def send_telegram_notification(
    message: str,
    check_result: CheckResult,
    db: Session,
    webhook_url: Optional[str] = None
):
    """
    Envía notificación por Telegram cuando un servicio cambia de estado.

    Args:
        message: Mensaje a enviar
        check_result: Resultado de la comprobación
        db: Sesión de base de datos
        webhook_url: URL del webhook de Coolify (opcional, para notificar a Coolify)
    """

    if not telegram_config.telegram_enabled or not telegram_config.telegram_bot_token:
        return False

    token = telegram_config.telegram_bot_token
    chat_id = telegram_config.telegram_chat_id

    if not chat_id:
        return False

    formatted_message = format_notification_message(message, check_result)

    async with aiohttp.ClientSession() as session:
        try:
            # Enviar a Telegram
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": formatted_message,
                "parse_mode": "HTML"
            }

            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                if resp.status == 200:
                    logger.info("Notificación enviada a Telegram: %s", message)
                else:
                    logger.warning("Error enviando a Telegram: %s", resp.status)
                    return False

            # Notificar a Coolify si está configurado webhook
            if webhook_url:
                async with session.get(webhook_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        logger.info("Webhook de Coolify notificado")
                    else:
                        logger.warning("Error notificando webhook de Coolify: %s", resp.status)

            return True

        except asyncio.TimeoutError:
            logger.error("Timeout enviando notificación")
            return False
        except Exception as e:
            logger.error("Error enviando notificación: %s", e)
            return False


def format_notification_message(message: str, check_result: CheckResult) -> str:
    """Formatea el mensaje con estilo para Telegram."""
    now = check_result.ts.strftime("%Y-%m-%d %H:%M:%S")
    service_name = check_result.service.name if hasattr(check_result.service, 'name') else check_result.service_id

    if check_result.up:
        status_emoji = "✅"
        status_text = "se ha reactivo"
    else:
        status_emoji = "❌"
        status_text = "ha caído"

    return f"""
<b>⚠️ {service_name} {status_text}</b>

• <b>Servicio:</b> {service_name}
• <b>Estado:</b> <code>{'ONLINE' if check_result.up else 'OFFLINE'}</code>
• <b>Tiempo:</b> {now}
"""
