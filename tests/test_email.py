# tests/test_email.py

import pytest
from fastapi import BackgroundTasks
from aiosmtpd.controller import Controller
from email import message_from_string
from email.header import decode_header

from app.utils.email import send_email
from app.core.config import settings


@pytest.fixture
def smtp_settings(monkeypatch):
    """
    Фикстура для переопределения SMTP настроек в тестовой среде.
    """
    monkeypatch.setattr(settings, "SMTP_HOST", "127.0.0.1")
    monkeypatch.setattr(settings, "SMTP_PORT", 8025)
    monkeypatch.setattr(settings, "SMTP_USER", "")  # Отключаем аутентификацию
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "")  # Отключаем аутентификацию
    monkeypatch.setattr(settings, "USE_TLS", False)
    monkeypatch.setattr(settings, "START_TLS", False)  # Отключаем STARTTLS для тестов
    monkeypatch.setattr(settings, "SMTP_TIMEOUT", 10.0)
    monkeypatch.setattr(settings, "TLS_CA_FILE", None)
    monkeypatch.setattr(settings, "TLS_CONTEXT", False)
    monkeypatch.setattr(settings, "EMAIL_TEMPLATES_DIR", "tests/templates")  # Убедитесь, что путь корректен
    monkeypatch.setattr(settings, "EMAILS_FROM_NAME", "Test Sender")
    monkeypatch.setattr(settings, "EMAILS_FROM_EMAIL", "sender@example.com")


@pytest.mark.asyncio
async def test_send_email(smtp_settings):
    # Создаем простой SMTP-сервер для тестирования
    class EmailHandler:
        def __init__(self):
            self.messages = []

        async def handle_DATA(self, server, session, envelope):
            self.messages.append(envelope.content.decode('utf8', errors='replace'))
            return '250 Message accepted for delivery'

    handler = EmailHandler()
    controller = Controller(handler, hostname='127.0.0.1', port=8025)
    controller.start()

    try:
        background_tasks = BackgroundTasks()
        await send_email(
            background_tasks,
            subject_template="Тестовое письмо",
            html_template="test_email.html",
            recipient="test@example.com",
            context={"name": "Тестовый пользователь"},
        )
        await background_tasks()

        # Проверяем, что письмо было получено
        assert len(handler.messages) == 1, "Сообщение не было получено тестовым SMTP сервером."

        # Разбираем сырое email-сообщение
        raw_email = handler.messages[0]
        email_message = message_from_string(raw_email)

        # Проверяем заголовок Subject
        decoded_subject_parts = decode_header(email_message["Subject"])
        decoded_subject = ""
        for part, encoding in decoded_subject_parts:
            if isinstance(part, bytes):
                decoded_subject += part.decode(encoding or 'utf-8')
            else:
                decoded_subject += part

        assert decoded_subject == "Тестовое письмо", "Тема письма не соответствует ожидаемой."

        # Получаем тело письма
        if email_message.is_multipart():
            # Ищем часть с типом content-type text/html
            body = ""
            for part in email_message.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))

                if content_type == "text/html" and "attachment" not in content_disposition:
                    body = part.get_payload(decode=True).decode('utf-8')
                    break
            else:
                pytest.fail("Не удалось найти часть с типом text/html в письме.")
        else:
            body = email_message.get_payload(decode=True).decode('utf-8')

        # Проверяем содержимое тела письма
        assert "Тестовый пользователь" in body, "Имя пользователя отсутствует в теле письма."
        assert "Это тестовое письмо." in body, "Текст письма отсутствует в теле письма."

    finally:
        controller.stop()
