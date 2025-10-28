"""service ownership fields

Revision ID: 20251027_0002
Revises: 20251027_0001
Create Date: 2025-10-27 00:30:00

"""

from alembic import op
import sqlalchemy as sa


revision = '20251027_0002'
down_revision = '20251027_0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('services', sa.Column('owner_user_id', sa.Integer(), nullable=True))
    op.add_column('services', sa.Column('owner_org_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_services_owner_user', 'services', 'users', ['owner_user_id'], ['id'])
    op.create_foreign_key('fk_services_owner_org', 'services', 'organizations', ['owner_org_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_services_owner_org', 'services', type_='foreignkey')
    op.drop_constraint('fk_services_owner_user', 'services', type_='foreignkey')
    op.drop_column('services', 'owner_org_id')
    op.drop_column('services', 'owner_user_id')


