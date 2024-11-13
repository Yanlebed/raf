# app/utils/email.py

from typing import Dict, Optional, Union
from fastapi import BackgroundTasks
from fastapi.templating import Jinja2Templates
from aiosmtplib import SMTP, SMTPException
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl
import logging

from app.core.config import settings

templates = Jinja2Templates(directory=settings.EMAIL_TEMPLATES_DIR)

async def send_email(
    background_tasks: BackgroundTasks,
    subject_template: str = "",
    html_template: str = "",
    recipient: str = "",
    context: Dict = {},
):
    """
    Создает email сообщение и добавляет задачу отправки в фоновые задачи.

    :param background_tasks: Экземпляр BackgroundTasks для добавления фоновых задач.
    :param subject_template: Тема письма.
    :param html_template: Шаблон HTML письма.
    :param recipient: Получатель письма.
    :param context: Контекст для рендеринга шаблона.
    """
    message = MIMEMultipart()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = recipient
    message["Subject"] = subject_template

    html_content = templates.get_template(html_template).render(**context)
    message.attach(MIMEText(html_content, "html"))

    background_tasks.add_task(_send_email_async, message)

async def _send_email_async(message: MIMEMultipart):
    """
    Асинхронно отправляет email сообщение через SMTP сервер.

    :param message: Объект MIMEMultipart с email сообщением.
    """
    smtp_kwargs = {
        "hostname": settings.SMTP_HOST,
        "port": settings.SMTP_PORT,
        "use_tls": settings.USE_TLS,  # Используем TLS, если это настроено
        "username": settings.SMTP_USER,
        "password": settings.SMTP_PASSWORD,
        "timeout": settings.SMTP_TIMEOUT,  # Таймаут соединения
    }

    # Создаем SSLContext, если требуется дополнительная настройка
    tls_context: Optional[Union[ssl.SSLContext, None]] = None
    if settings.USE_TLS and settings.TLS_CA_FILE:
        tls_context = ssl.create_default_context(cafile=settings.TLS_CA_FILE)
        # Дополнительная настройка SSLContext при необходимости

    try:
        smtp = SMTP(
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            use_tls=settings.USE_TLS,
            start_tls=settings.START_TLS,  # Новый параметр для управления STARTTLS
            tls_context=tls_context,
            timeout=settings.SMTP_TIMEOUT,
        )
        await smtp.connect()

        # Если используется STARTTLS и соединение не защищено, инициируем TLS
        if not settings.USE_TLS and settings.START_TLS:
            await smtp.starttls()

        # Выполняем аутентификацию только если SMTP_USER и SMTP_PASSWORD не пусты
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            await smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        await smtp.send_message(message)
    except SMTPException as e:
        # Логируем ошибку вместо использования print
        logging.error(f"Ошибка при отправке email: {e}")
    finally:
        if smtp:
            await smtp.quit()