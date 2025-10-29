"""user social links

Revision ID: 20251027_0005
Revises: 20251027_0004
Create Date: 2025-10-27 01:20:00

"""

from alembic import op
import sqlalchemy as sa


revision = '20251027_0005'
down_revision = '20251027_0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('facebook_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('instagram_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('tiktok_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('telegram_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('whatsapp', sa.String(), nullable=True))
    op.add_column('users', sa.Column('viber', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'viber')
    op.drop_column('users', 'whatsapp')
    op.drop_column('users', 'telegram_url')
    op.drop_column('users', 'tiktok_url')
    op.drop_column('users', 'instagram_url')
    op.drop_column('users', 'facebook_url')


