# Status Page · Reigreengroup

Página de estado de servicios con backend Python (FastAPI) y frontend React (Vite + TypeScript).

## Características

- Monitorización **cada 5 minutos** de todos los servicios configurados.
- Histórico de uptime en SQLite con retención de **7 días** (se limpia automáticamente).
- Soporta checks **HTTP(S)** (públicos o red privada NetBird) y **MySQL/MariaDB**.
- API REST: `/api/status`, `/api/history/{id}?days=N`, `/api/health`.
- Frontend en español con tira de estado 24 h, % de uptime y gráfica de latencia de 7 días.
- Contenedor único listo para **Coolify** (el backend sirve el frontend compilado).
- **Marca blanca**: el nombre (`APP_NAME`) y los servicios (`SVC_*`) se configuran por
  variables de entorno — para una versión pública no hay que tocar código.

## Versión pública (marca blanca)

Todo se configura por variables de entorno, sin tocar código ni imagen:

| Variable | Función |
|---|---|
| `APP_NAME` | Nombre mostrado en la web (banner, pie, título del navegador) y en la API |
| `SVC_<ID>_<CAMPO>` | Los servicios a monitorizar, una variable por campo |
| `SERVICES_FILE` | Alternativa: ruta a un fichero YAML montado por volumen |

Por defecto se usa `backend/services.yaml` de este repositorio (contenido
genérico de ejemplo, para desarrollo). Si existe alguna variable `SVC_*`, definen
la lista completa y el fichero se ignora (prioridad: `SVC_*` > `SERVICES_FILE` >
repo).

### Servicios por variables de entorno

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

Campos HTTP: `NAME`, `URL`, `DOCS_URL`, `DESCRIPTION`, `VERIFY_TLS` (defecto
`true`). Campos MySQL: `TYPE=mysql`, `NAME`, `HOST`, `PORT` (defecto `3306`).
El `ID` se usa como clave del histórico y para ordenar (alfabético).

### En Coolify

1. Crea el recurso desde este repositorio y añade en la UI las variables
   `APP_NAME` y las `SVC_*` que necesites.
2. Mantén el volumen `status-data` en `/data` (histórico persistente).
3. Healthcheck contra `/api/health`.

Ni la imagen ni el repositorio contienen infraestructura privada, y cambiar
servicios es editar variables y redesplegar.

## Servicios iniciales

Los de producción de Reigreengroup se definen por variables de entorno
(fichero `services.env`, no publicado en el repositorio). El
`backend/services.yaml` del repo es solo un ejemplo genérico.

## Añadir un servicio

En producción, añade variables `SVC_*` y redespliega (ver "Versión pública").

Para la vía fichero, editar `backend/services.yaml` (o tu `SERVICES_FILE`):

```yaml
  - id: mi_servicio          # identificador único
    name: Mi Servicio        # nombre mostrado
    type: http
    url: https://ejemplo.com
    verify_tls: true         # opcional (false para NetBird con certificados propios)
    docs_url: https://…      # opcional: documentación pública (enlace en la tarjeta)
    description: Qué es y cómo está montado.   # opcional: se muestra en la tarjeta
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
| **`APP_NAME`** | `Reigreengroup` | Nombre del proyecto mostrado en la web y la API (despliegues de marca blanca) |
| **`SVC_<ID>_<CAMPO>`** | — | Servicios a monitorizar (ver "Versión pública") |
| `SERVICES_FILE` | vacío | Ruta alternativa al YAML de servicios |
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
# Backend (con los servicios reales de producción, si tienes services.env)
set -a; source services.env 2>/dev/null; set +a
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
