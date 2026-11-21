# Projects Status Page

---

## English

**Self-hosted, white-label service status page**, ready to deploy on Coolify. A
single container: Python backend (FastAPI) serving the compiled React frontend
(Vite + TypeScript).

Everything is configured via **environment variables** — the project name and
the list of monitored services travel with the deployment, not with the code.
To hand the project to a client, just create a new resource with their variables.

Production example: https://status.reigreengroup.com

### Features

- **Every 5 minutes** monitoring of all configured services.
- **HTTP(S)** checks (public or private network such as WireGuard/NetBird) and **MySQL/MariaDB**.
- Uptime history in SQLite with **7-day** retention (auto-cleaned).
- REST API: `/api/status`, `/api/history/{id}?days=N`, `/api/health`.
- Spanish frontend: 24 h status, uptime %, 7-day latency chart, description and
  documentation link for each service.
- **Telegram** notifications when a service goes down or recovers (optional).

### Configuration

#### Project name

`APP_NAME` sets the name displayed on the web (banner, footer, browser title)
and in the API.

#### Services

Services are defined with `SVC_<ID>_<FIELD>` variables, one per field:

```bash
APP_NAME=My Client

SVC_WEB_NAME=Web
SVC_WEB_URL=https://web.client.com

SVC_API_NAME=API
SVC_API_URL=https://api.client.com
SVC_API_DOCS_URL=https://api.client.com/docs
SVC_API_DESCRIPTION=Public API for the client

SVC_BD_TYPE=mysql
SVC_BD_NAME=Database
SVC_BD_HOST=db.internal
SVC_BD_PORT=3306
```

| Type | Fields |
|---|---|
| HTTP | `NAME`, `URL`, `DOCS_URL`, `DESCRIPTION`, `VERIFY_TLS` (default `true`) |
| MySQL | `TYPE=mysql`, `NAME`, `HOST`, `PORT` (default `3306`) |

- The `ID` is the history key and sorts the list (alphabetical).
- `DOCS_URL` adds a "Documentation" link on the card and `DESCRIPTION` adds a
  brief architecture line.
- With MySQL credentials (`MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
  global) the check validates login; without them, only TCP connection.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| **`APP_NAME`** | `Status Page` | Project name displayed on the web and API |
| **`SVC_<ID>_<FIELD>`** | — | Services to monitor (see "Services") |
| `PORT` | `8000` | Container port |
| `DATA_DIR` | `/data` | Where `status.db` is stored (mount volume) |
| `CHECK_INTERVAL_MINUTES` | `5` | Check interval |
| `RETENTION_DAYS` | `7` | History retention days |
| `MYSQL_USER` | empty | MySQL user (optional) |
| `MYSQL_PASSWORD` | empty | MySQL password (optional) |
| `MYSQL_DATABASE` | empty | MySQL database (optional) |
| **`TELEGRAM_ENABLED`** | `false` | Enable Telegram notifications |
| **`TELEGRAM_BOT_TOKEN`** | (empty) | Telegram bot token |
| **`TELEGRAM_CHAT_ID`** | (empty) | Telegram chat/group ID |
| `COOLIFY_WEBHOOK_URL` | (empty) | Coolify webhook URL (optional) |

See `.env.example`.

### Deploy on Coolify

1. Create the **Docker Compose** resource pointing to this repository.
2. Add the client's `APP_NAME` and `SVC_*` variables in the UI.
3. Keep the `status-data` volume at `/data` (history survives deployments).
4. Expose port `8000` and configure the healthcheck against `/api/health`.

> **Private network note:** internal services (e.g. `.netbird.vpn`) are only
> accessible from servers inside that network (the Coolify host must have the
> client connected).

### Local Development

```bash
# Backend
python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt
DATA_DIR=./data .venv/bin/uvicorn app.main:app --app-dir backend --reload

# Frontend (another terminal; /api is proxied to 8000)
cd frontend && npm install && npm run dev
```

Without `SVC_*` variables, `backend/services.yaml` is used — a generic example
for development. To test with real services, export the variables before
starting (e.g. `set -a; source services.env; set +a`).

### Local Docker

```bash
docker compose up --build
# http://localhost:8000
```

---

## Español

Página de estado de servicios **autoalojada y de marca blanca**, lista para
desplegar en Coolify. Un solo contenedor: backend Python (FastAPI) que sirve el
frontend React (Vite + TypeScript) compilado.

Todo se configura por **variables de entorno** — el nombre del proyecto y la
lista de servicios monitorizados viajan con el despliegue, no con el código.
Para dar el proyecto a un cliente basta con crear un recurso nuevo con sus
variables.

Proyecto de ejemplo Producción: https://status.reigreengroup.com

### Características

- Monitorización **cada 5 minutos** de todos los servicios configurados.
- Checks **HTTP(S)** (públicos o red privada tipo WireGuard/NetBird) y **MySQL/MariaDB**.
- Histórico de uptime en SQLite con retención de **7 días** (se limpia automáticamente).
- API REST: `/api/status`, `/api/history/{id}?days=N`, `/api/health`.
- Frontend en español: tira de estado 24 h, % de uptime, gráfica de latencia de
  7 días, descripción y enlace a la documentación de cada servicio.
- Notificaciones por **Telegram** cuando un servicio cae o se recupera (opcional).

### Configuración

#### Nombre del proyecto

`APP_NAME` fija el nombre mostrado en la web (banner, pie, título del
navegador) y en la API.

#### Servicios

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

### Variables de entorno

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

### Despliegue en Coolify

1. Crear el recurso **Docker Compose** apuntando a este repositorio.
2. Añadir en la UI las variables `APP_NAME` y `SVC_*` del cliente.
3. Mantener el volumen `status-data` en `/data` (el histórico sobrevive a los
   despliegues).
4. Exponer el puerto `8000` y configurar el healthcheck contra `/api/health`.

> **Nota red privada:** los servicios internos (p. ej. `.netbird.vpn`) solo son
> accesibles desde servidores dentro de esa red (el host de Coolify debe tener
> el cliente conectado).

### Desarrollo local

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

### Docker local

```bash
docker compose up --build
# http://localhost:8000
```

---

## 日本語

**セルフホスト型、ホワイトラベルのサービスステータスページ**。Coolifyにデプロイ
可能です。単一のコンテナ：Pythonバックエンド（FastAPI）がコンパイル済みReact
フロントエンド（Vite + TypeScript）を提供します。

すべては**環境変数**で設定されます——プロジェクト名と監視対象サービスの一覧は
コードではなくデプロイ時に渡されます。クライアントにプロジェクトを渡すには、
変数付きで新しいリソースを作成するだけです。

本番例：https://status.reigreengroup.com

### 機能

- 設定されたすべてのサービスの**5分ごと**の監視。
- **HTTP(S)** チェック（パブリックまたはWireGuard/NetBirdなどのプライベートネットワーク）および**MySQL/MariaDB**。
- SQLiteによる稼働時間履歴、**7日間**保持（自動削除）。
- REST API：`/api/status`、`/api/history/{id}?days=N`、`/api/health`。
- スペイン語フロントエンド：24時間ステータス、稼働率％、7日間のレイテンシグラフ、
  各サービスの説明とドキュメントリンク。
- サービスのダウンまたは回復時の**Telegram**通知（オプション）。

### 設定

#### プロジェクト名

`APP_NAME`はウェブ（バナー、フッター、ブラウザタイトル）およびAPIで表示される
名前を設定します。

#### サービス

サービスは `SVC_<ID>_<フィールド>` 変数で定義され、フィールドごとに1つ設定します：

```bash
APP_NAME=My Client

SVC_WEB_NAME=Web
SVC_WEB_URL=https://web.client.com

SVC_API_NAME=API
SVC_API_URL=https://api.client.com
SVC_API_DOCS_URL=https://api.client.com/docs
SVC_API_DESCRIPTION=Public API for the client

SVC_BD_TYPE=mysql
SVC_BD_NAME=Database
SVC_BD_HOST=db.internal
SVC_BD_PORT=3306
```

| タイプ | フィールド |
|---|---|
| HTTP | `NAME`、`URL`、`DOCS_URL`、`DESCRIPTION`、`VERIFY_TLS`（デフォルト `true`） |
| MySQL | `TYPE=mysql`、`NAME`、`HOST`、`PORT`（デフォルト `3306`） |

- `ID` は履歴のキーであり、リストのソート順（アルファベット順）を決定します。
- `DOCS_URL` はカードに「ドキュメント」リンクを追加し、`DESCRIPTION` は簡潔な
  アーキテクチャ説明を追加します。
- MySQL認証情報（`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE` グローバル）
  がある場合、チェックはログインを検証します。ない場合はTCP接続のみ。

### 環境変数

| 変数 | デフォルト | 説明 |
|---|---|---|
| **`APP_NAME`** | `Status Page` | ウェブとAPIで表示されるプロジェクト名 |
| **`SVC_<ID>_<フィールド>`** | — | 監視対象サービス（「サービス」参照） |
| `PORT` | `8000` | コンテナポート |
| `DATA_DIR` | `/data` | `status.db` の保存先（ボリュームマウント） |
| `CHECK_INTERVAL_MINUTES` | `5` | チェック間隔 |
| `RETENTION_DAYS` | `7` | 履歴保持日数 |
| `MYSQL_USER` | 空 | MySQLユーザー（オプション） |
| `MYSQL_PASSWORD` | 空 | MySQLパスワード（オプション） |
| `MYSQL_DATABASE` | 空 | MySQLデータベース（オプション） |
| **`TELEGRAM_ENABLED`** | `false` | Telegram通知を有効化 |
| **`TELEGRAM_BOT_TOKEN`** | （空） | Telegramボットトークン |
| **`TELEGRAM_CHAT_ID`** | （空） | Telegramチャット/グループID |
| `COOLIFY_WEBHOOK_URL` | （空） | CoolifyウェブフックURL（オプション） |

`.env.example` を参照。

### Coolifyへのデプロイ

1. このリポジトリを指す**Docker Compose**リソースを作成します。
2. UIでクライアントの `APP_NAME` と `SVC_*` 変数を追加します。
3. `/data` に `status-data` ボリュームを維持します（履歴はデプロイ後も保持されます）。
4. ポート `8000` を公開し、`/api/health` に対してヘルスチェックを設定します。

> **プライベートネットワークの注意：** 内部サービス（例：`.netbird.vpn`）はその
> ネットワーク内のサーバーからのみアクセス可能です（Coolifyホストはクライアント
> が接続されている必要があります）。

### ローカル開発

```bash
# バックエンド
python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt
DATA_DIR=./data .venv/bin/uvicorn app.main:app --app-dir backend --reload

# フロントエンド（別のターミナル；/apiは8000にプロキシ）
cd frontend && npm install && npm run dev
```

`SVC_*` 変数がない場合、`backend/services.yaml` が使用されます——開発用の汎用
例です。実際のサービスでテストするには、起動前に変数をエクスポートします
（例：`set -a; source services.env; set +a`）。

### ローカルDocker

```bash
docker compose up --build
# http://localhost:8000
```
