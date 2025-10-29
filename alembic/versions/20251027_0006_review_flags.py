"""review flags

Revision ID: 20251027_0006
Revises: 20251027_0005
Create Date: 2025-10-27 01:30:00

"""

from alembic import op
import sqlalchemy as sa


revision = '20251027_0006'
down_revision = '20251027_0005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('reviews', sa.Column('anonymous', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('reviews', sa.Column('verified', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('reviews', 'verified')
    op.drop_column('reviews', 'anonymous')


