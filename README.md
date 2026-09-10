# Projects Status Page

Página de estado de servicios **autoalojada y de marca blanca**, lista para
desplegar en Coolify. Un solo contenedor: backend Python (FastAPI) que sirve el
frontend React (Vite + TypeScript) compilado.

Todo se configura por **variables de entorno** — el nombre del proyecto y la
lista de servicios monitorizados viajan con el despliegue, no con el código.
Para dar el proyecto a un cliente basta con crear un recurso nuevo con sus
variables.

## Características

- Monitorización **cada 5 minutos** de todos los servicios configurados.
- Checks **HTTP(S)** (públicos o red privada tipo WireGuard/NetBird) y **MySQL/MariaDB**.
- Histórico de uptime en SQLite con retención de **7 días** (se limpia automáticamente).
- API REST: `/api/status`, `/api/history/{id}?days=N`, `/api/health`.
- Frontend en español: tira de estado 24 h, % de uptime, gráfica de latencia de
  7 días, descripción y enlace a la documentación de cada servicio.
- Notificaciones por **Telegram** cuando un servicio cae o se recupera (opcional).

## Configuración

### Nombre del proyecto

`APP_NAME` fija el nombre mostrado en la web (banner, pie, título del
navegador) y en la API.

### Servicios

Los servicios se definen con variables `SVC_<ID>_<CAMPO>`, una por campo:

```bash
APP_NAME=Mi Cliente

SVC_WEB_NAME=Web
SVC_WEB_URL=https://web.cliente.com

SVC_API_NAME=API
SVC_API_URL=https://api.cliente.com
SVC_API_DOCS_URL=https://api.cliente.com/docs
SVC_API_DESCRIPTION=API pública del cliente

SVC_BD_TYPE=mysql
SVC_BD_NAME=Base de datos
SVC_BD_HOST=db.interno
SVC_BD_PORT=3306
```

| Tipo | Campos |
|---|---|
| HTTP | `NAME`, `URL`, `DOCS_URL`, `DESCRIPTION`, `VERIFY_TLS` (defecto `true`) |
| MySQL | `TYPE=mysql`, `NAME`, `HOST`, `PORT` (defecto `3306`) |

- El `ID` es la clave del histórico y ordena la lista (alfabético).
- `DOCS_URL` añade un enlace "Documentación" en la tarjeta y `DESCRIPTION` una
  breve línea de arquitectura.
- Con credenciales MySQL (`MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
  globales) el check valida el login; sin ellas, solo la conexión TCP.

## Variables de entorno

| Variable | Defecto | Descripción |
|---|---|---|
| **`APP_NAME`** | `Status Page` | Nombre del proyecto mostrado en la web y la API |
| **`SVC_<ID>_<CAMPO>`** | — | Servicios a monitorizar (ver "Servicios") |
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

## Despliegue en Coolify

1. Crear el recurso **Docker Compose** apuntando a este repositorio.
2. Añadir en la UI las variables `APP_NAME` y `SVC_*` del cliente.
3. Mantener el volumen `status-data` en `/data` (el histórico sobrevive a los
   despliegues).
4. Exponer el puerto `8000` y configurar el healthcheck contra `/api/health`.

> **Nota red privada:** los servicios internos (p. ej. `.netbird.vpn`) solo son
> accesibles desde servidores dentro de esa red (el host de Coolify debe tener
> el cliente conectado).

## Desarrollo local

```bash
# Backend
python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt
DATA_DIR=./data .venv/bin/uvicorn app.main:app --app-dir backend --reload

# Frontend (otra terminal; /api se proxea al 8000)
cd frontend && npm install && npm run dev
```

Sin variables `SVC_*` se usa `backend/services.yaml`, un ejemplo genérico pensado
para desarrollo. Para probar con servicios reales, exporta las variables antes
de arrancar (p. ej. `set -a; source services.env; set +a`).

## Docker local

```bash
docker compose up --build
# http://localhost:8000
```
