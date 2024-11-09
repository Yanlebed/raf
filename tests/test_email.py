import pytest
from fastapi import BackgroundTasks
from aiosmtpd.controller import Controller
from email.message import EmailMessage

from app.utils.email import send_email
from app.core.config import settings

@pytest.mark.asyncio
async def test_send_email():
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
        send_email(
            background_tasks,
            subject_template="Тестовое письмо",
            html_template="test_email.html",
            recipient="test@example.com",
            context={"name": "Тестовый пользователь"},
        )
        await background_tasks()
        # Проверяем, что письмо было получено
        assert len(handler.messages) == 1
        assert "Тестовое письмо" in handler.messages[0]
    finally:
        controller.stop()
