# app/core/config.py

import os
from pydantic import BaseSettings
from typing import Optional, List
from dotenv import load_dotenv

# Load environment variables from a .env file if present
load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "raf"
    API_V1_STR: str = "/api/v1"
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin@localhost/raf_test")
    # Синхронный URL базы данных для Alembic
    SQLALCHEMY_SYNC_DATABASE_URI: str = "postgresql+psycopg2://admin:admin@localhost/raf_test"

    TEST_DATABASE_URL: str = os.getenv("TEST_DATABASE_URL", "sqlite+aiosqlite:///./test.db")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "your_email@example.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "your_email_password")

    # Добавленные настройки для SMTP
    USE_TLS: bool = False  # Использовать TLS при подключении
    START_TLS: bool = False  # Использовать STARTTLS, если USE_TLS=False
    SMTP_TIMEOUT: float = 10.0  # Таймаут соединения в секундах
    TLS_CA_FILE: Optional[str] = None  # Путь к CA файлу, если требуется
    TLS_CONTEXT: bool = False  # Использовать пользовательский SSLContext

    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "your_email@example.com")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "Your App Name")
    EMAIL_TEMPLATES_DIR: str = "app/email_templates"
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    SERVER_HOST: str = os.getenv("SERVER_HOST", "http://localhost:8000")

    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "fake_sid")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "fake_token")
    TWILIO_FROM_NUMBER: str = os.getenv("TWILIO_FROM_NUMBER", "+1234567890")
    SMS_CODE_EXPIRE_MINUTES: int = 15

    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME: str = os.getenv("AWS_STORAGE_BUCKET_NAME")
    AWS_REGION_NAME: str = os.getenv("AWS_REGION_NAME", "us-east-1")
    AWS_S3_ENDPOINT_URL: Optional[str] = os.getenv("AWS_S3_ENDPOINT_URL")  # Для совместимых сервисов

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # Slots / Holds
    SLOT_HOLD_MINUTES: int = int(os.getenv("SLOT_HOLD_MINUTES", 10))

    # Media constraints
    MAX_IMAGE_SIZE_MB: int = int(os.getenv("MAX_IMAGE_SIZE_MB", 5))
    MAX_VIDEO_SIZE_MB: int = int(os.getenv("MAX_VIDEO_SIZE_MB", 50))
    ALLOWED_IMAGE_TYPES: List[str] = [
        "image/jpeg", "image/png", "image/webp", "image/gif"
    ]
    ALLOWED_VIDEO_TYPES: List[str] = [
        "video/mp4", "video/quicktime", "video/webm"
    ]

    class Config:
        case_sensitive = True


settings = Settings()
