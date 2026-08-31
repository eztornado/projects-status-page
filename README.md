# Status Page · Reigreengroup

Página de estado de servicios con backend Python (FastAPI) y frontend React (Vite + TypeScript).

## Características

- Monitorización **cada 5 minutos** de todos los servicios configurados.
- Histórico de uptime en SQLite con retención de **7 días** (se limpia automáticamente).
- Soporta checks **HTTP(S)** (públicos o red privada NetBird) y **MySQL/MariaDB**.
- API REST: `/api/status`, `/api/history/{id}?days=N`, `/api/health`.
- Frontend en español con tira de estado 24 h, % de uptime y gráfica de latencia de 7 días.
- Contenedor único listo para **Coolify** (el backend sirve el frontend compilado).

## Servicios iniciales

| Servicio | Destino | Tipo |
|---|---|---|
| Web | https://reigreengroup.com | HTTP |
| API | https://api.reigreengroup.com | HTTP |
| Portal de clientes | https://clientes.reigreengroup.com | HTTP |
| OMIE | https://omie.reigreengroup.com | HTTP |
| OCR | https://ocr.reigreengroup.com | HTTP |
| Magika | https://magika.reigreengroup.com | HTTP |
| llama.cpp (red local) | http://cos-alicante.netbird.vpn:8080/health | HTTP |
| N8N | https://n8n.reigreengroup.com | HTTP |
| Gestión Redes Sociales | http://redes.reigreengroup.com | HTTP |
| ClawBot (red local) | http://clawbot.netbird.vpn | HTTP |
| Base de datos (red local) | tornadocore.netbird.vpn:3306 | MySQL |

## Añadir un servicio

Editar `backend/services.yaml` y reiniciar (o redesplegar en Coolify):

```yaml
  - id: mi_servicio          # identificador único
    name: Mi Servicio        # nombre mostrado
    type: http
    url: https://ejemplo.com
    verify_tls: true         # opcional (false para NetBird con certificados propios)
```

Para MySQL:

```yaml
  - id: mi_bd
    name: Mi BD
    type: mysql
    host: mihost.netbird.vpn
    port: 3306
    credentials_env:         # nombres de variables de entorno (opcionales)
      user: MI_BD_USER
      password: MI_BD_PASS
      database: MI_BD_DB
```

Sin credenciales el check MySQL se limita a verificar la conexión TCP.

## Variables de entorno

| Variable | Defecto | Descripción |
|---|---|---|
| `PORT` | `8000` | Puerto del contenedor |
| `DATA_DIR` | `/data` | Dónde se guarda `status.db` (montar volumen) |
| `CHECK_INTERVAL_MINUTES` | `5` | Intervalo de comprobación |
| `RETENTION_DAYS` | `7` | Días de retención del histórico |
| `MYSQL_USER` | vacío | Usuario MySQL (opcional) |
| `MYSQL_PASSWORD` | vacío | Contraseña MySQL (opcional) |
| `MYSQL_DATABASE` | vacío | Base de datos MySQL (opcional) |
| **`TELEGRAM_ENABLED`** | `false` | Habilitar notificaciones por Telegram |
| **`TELEGRAM_BOT_TOKEN`** | (vacío) | Token del bot de Telegram |
| **`TELEGRAM_CHAT_ID`** | (vacío) | ID del chat/grupo de Telegram |
| `COOLIFY_WEBHOOK_URL` | (vacío) | URL del webhook de Coolify (opcional) |

Ver `.env.example`.

## Desarrollo local

```bash
# Backend
python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt
DATA_DIR=./data .venv/bin/uvicorn app.main:app --app-dir backend --reload

# Frontend (otra terminal; /api se proxea al 8000)
cd frontend && npm install && npm run dev
```

## Despliegue en Coolify

1. Crear recurso **Docker Compose** apuntando a este repositorio.
2. Definir las variables de entorno necesarias (p. ej. `MYSQL_*`) en la UI.
3. Exponer el puerto `8000` y configurar el healthcheck contra `/api/health`.
4. El volumen `status-data` persiste la base de datos entre despliegues.

> **Nota NetBird:** los servicios `.netbird.vpn` solo son accesibles desde servidores
> dentro de la red NetBird (el host de Coolify debe tener el cliente NetBird conectado).

## Docker local

```bash
docker compose up --build
# http://localhost:8000
```
