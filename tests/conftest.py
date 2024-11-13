import pytest
import tempfile
import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from httpx import AsyncClient

from app.db.base import Base
from app.main import app


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


# Добавляем фикстуру 'db', которая использует 'async_session'
@pytest.fixture(scope="function")
async def db(async_session):
    yield async_session


# Фикстура для асинхронного клиента
@pytest.fixture(scope="session")
async def async_client():
    async with AsyncClient(app=app, base_url="http://localhost") as ac:
        yield ac
