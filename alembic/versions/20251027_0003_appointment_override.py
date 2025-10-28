"""appointment duration override

Revision ID: 20251027_0003
Revises: 20251027_0002
Create Date: 2025-10-27 00:50:00

"""

from alembic import op
import sqlalchemy as sa


revision = '20251027_0003'
down_revision = '20251027_0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('appointments', sa.Column('duration_override', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('appointments', 'duration_override')


