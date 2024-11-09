
from typing import Dict

from fastapi import BackgroundTasks
from fastapi.templating import Jinja2Templates
from aiosmtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

templates = Jinja2Templates(directory=settings.EMAIL_TEMPLATES_DIR)


def send_email(
    background_tasks: BackgroundTasks,
    subject_template: str = "",
    html_template: str = "",
    recipient: str = "",
    context: Dict = {},
):
    message = MIMEMultipart()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = recipient
    message["Subject"] = subject_template

    html_content = templates.get_template(html_template).render(**context)
    message.attach(MIMEText(html_content, "html"))

    background_tasks.add_task(_send_email_async, message)


async def _send_email_async(message):
    smtp = SMTP(hostname=settings.SMTP_HOST, port=settings.SMTP_PORT, use_tls=False)
    await smtp.connect()
    await smtp.starttls()
    await smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    await smtp.send_message(message)
    await smtp.quit()
