import pytest
import asyncio
import tempfile
import os

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.db.base import Base

# Фикстура для цикла событий asyncio
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()

# Фикстура для создания временной базы данных
@pytest.fixture(scope="session")
def temp_database():
    # Создаем временный файл для базы данных
    db_fd, db_path = tempfile.mkstemp()
    os.close(db_fd)
    yield f"sqlite+aiosqlite:///{db_path}"
    # Удаляем файл базы данных после тестов
    os.unlink(db_path)

# Фикстура для асинхронного движка базы данных
@pytest.fixture(scope="session")
async def async_engine(temp_database):
    engine = create_async_engine(
        temp_database,
        echo=False,
        poolclass=NullPool
    )
    # Создаем все таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

# Фикстура для асинхронной сессии базы данных
@pytest.fixture(scope="function")
async def async_session(async_engine):
    async_session_maker = async_sessionmaker(
        bind=async_engine,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )
    async with async_session_maker() as session:
        yield session
        await session.rollback()
