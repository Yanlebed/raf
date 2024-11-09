import os
from pydantic import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "raf"
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/dbname")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "your_email@example.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "your_email_password")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "your_email@example.com")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "Your App Name")
    EMAIL_TEMPLATES_DIR: str = "app/email_templates"
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    SERVER_HOST: str = os.getenv("SERVER_HOST", "http://localhost:8000")

    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_FROM_NUMBER: str = os.getenv("TWILIO_FROM_NUMBER")
    SMS_CODE_EXPIRE_MINUTES: int = 15

    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME: str = os.getenv("AWS_STORAGE_BUCKET_NAME")
    AWS_REGION_NAME: str = os.getenv("AWS_REGION_NAME", "us-east-1")
    AWS_S3_ENDPOINT_URL: Optional[str] = os.getenv("AWS_S3_ENDPOINT_URL")  # Для совместимых сервисов

    class Config:
        case_sensitive = True


settings = Settings()
