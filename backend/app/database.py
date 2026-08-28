from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import settings

settings.data_dir.mkdir(parents=True, exist_ok=True)

engine = create_async_engine(
    f"sqlite+aiosqlite:///{settings.data_dir / 'status.db'}",
    connect_args={"timeout": 30},
)

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    from .models import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.exec_driver_sql("PRAGMA journal_mode=WAL")


async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
