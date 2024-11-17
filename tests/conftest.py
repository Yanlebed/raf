# tests/conftest.py

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.core.config import settings

@pytest_asyncio.fixture(scope="function")
async def async_engine():
    """Create a new database engine for each test function."""
    engine = create_async_engine(
        settings.TEST_DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
    )
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    # Drop tables after the test function
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db(async_engine) -> AsyncSession:
    """Create a new database session for a test."""
    async_session_maker = sessionmaker(
        bind=async_engine,
        expire_on_commit=False,
        class_=AsyncSession,
    )
    async with async_engine.connect() as connection:
        # Begin a nested transaction (SAVEPOINT)
        trans = await connection.begin()
        session = async_session_maker(bind=connection)
        try:
            yield session
        finally:
            # Roll back the transaction after the test
            await session.close()
            await trans.rollback()

@pytest_asyncio.fixture(scope="function")
async def async_client(db):
    """Create an HTTP client for testing."""
    from app.main import app
    from httpx import AsyncClient
    from httpx._transports.asgi import ASGITransport
    from app.api.deps import get_db

    # Override the get_db dependency to use the test database session
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

    # Clean up the dependency override after the test
    app.dependency_overrides.pop(get_db, None)
