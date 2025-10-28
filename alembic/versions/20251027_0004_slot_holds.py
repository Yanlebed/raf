"""slot holds

Revision ID: 20251027_0004
Revises: 20251027_0003
Create Date: 2025-10-27 01:05:00

"""

from alembic import op
import sqlalchemy as sa


revision = '20251027_0004'
down_revision = '20251027_0003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'slot_holds',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), nullable=False),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('slot_holds')


