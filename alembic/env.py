import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Добавьте путь к вашему приложению в sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Импортируйте настройки и модели
from app.core.config import settings
from app.db.base import Base  # Импортируйте ваши модели сюда

# Настройка логирования
config = context.config
# Load logging config only when alembic.ini is present
if config.config_file_name:
    fileConfig(config.config_file_name)

# Устанавливаем синхронный URL базы данных
config.set_main_option('sqlalchemy.url', settings.SQLALCHEMY_SYNC_DATABASE_URI)

# Устанавливаем метаданные для автогенерации миграций
target_metadata = Base.metadata

def run_migrations_offline():
    """Запуск миграций в офлайн-режиме."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,  # Для сравнения типов данных
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Запуск миграций в онлайн-режиме."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # Для сравнения типов данных
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
