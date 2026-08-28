import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .api.routes import router
from .config import settings
from .database import init_db
from .scheduler import run_all_checks, start_scheduler, sync_services

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await sync_services()
    await run_all_checks()
    scheduler = start_scheduler()
    logger.info("Status page lista (intervalo %d min)", settings.check_interval_minutes)
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="Reigreengroup Status", lifespan=lifespan)
app.include_router(router)

if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        candidate = STATIC_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
