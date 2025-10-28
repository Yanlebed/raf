"""initial schema

Revision ID: 20251027_0001
Revises: 
Create Date: 2025-10-27 00:00:00

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251027_0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Locations
    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('city', sa.String(), nullable=False, index=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
    )

    # Organizations
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
    )

    # Enums
    usertype = sa.Enum('MASTER', 'CLIENT', 'SALON', 'ADMIN', name='usertype')
    usertype.create(op.get_bind(), checkfirst=True)

    servicecategory = sa.Enum('Стрижка', 'Маникюр', name='servicecategory')
    servicecategory.create(op.get_bind(), checkfirst=True)

    confirmationstatus = sa.Enum(
        'Ожидает подтверждения', 'Подтверждена', 'Отменена клиентом', 'Отменена мастером', 'Завершена',
        name='confirmationstatus'
    )
    confirmationstatus.create(op.get_bind(), checkfirst=True)

    paymentmethod = sa.Enum('Наличные', 'Карта', 'Онлайн-оплата', name='paymentmethod')
    paymentmethod.create(op.get_bind(), checkfirst=True)

    paymentstatus = sa.Enum('Оплачено', 'Не оплачено', 'Частично оплачено', name='paymentstatus')
    paymentstatus.create(op.get_bind(), checkfirst=True)

    orgrole = sa.Enum('OWNER', 'MANAGER', 'MASTER', name='organizationrole')
    orgrole.create(op.get_bind(), checkfirst=True)

    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_type', sa.Enum(name='usertype'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('is_phone_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('avatar', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('short_description', sa.Text(), nullable=True),
        sa.Column('experience_years', sa.Integer(), nullable=True),
        sa.Column('home_service', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_users_phone', 'users', ['phone'], unique=True)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # User credentials
    op.create_table(
        'user_credentials',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('password_hash', sa.String(), nullable=False),
    )

    # Services
    op.create_table(
        'services',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('category', sa.Enum(name='servicecategory'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
    )

    # Association user_services (no explicit PK in models)
    op.create_table(
        'user_services',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), nullable=False),
    )

    # Appointments
    op.create_table(
        'appointments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), nullable=False),
        sa.Column('appointment_code', sa.String(), nullable=True, unique=True),
        sa.Column('appointment_date', sa.DateTime(), nullable=False),
        sa.Column('confirmation_status', sa.Enum(name='confirmationstatus'), nullable=True),
        sa.Column('payment_method', sa.Enum(name='paymentmethod'), nullable=True),
        sa.Column('payment_status', sa.Enum(name='paymentstatus'), nullable=True),
        sa.Column('client_notes', sa.Text(), nullable=True),
        sa.Column('master_notes', sa.Text(), nullable=True),
        sa.Column('service_location', sa.String(), nullable=True),
        sa.Column('reminders', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('price', sa.Float(), nullable=True),
    )

    # Reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('salon_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # Master photos
    op.create_table(
        'master_photos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('photo_url', sa.String(), nullable=False),
    )

    # Master schedule
    op.create_table(
        'master_schedule',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
    )

    # Phone verifications
    op.create_table(
        'phone_verifications',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('verification_code', sa.String(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=False),
    )

    # User-organization membership
    op.create_table(
        'user_organizations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('role', sa.Enum(name='organizationrole'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('user_organizations')
    op.drop_table('phone_verifications')
    op.drop_table('master_schedule')
    op.drop_table('master_photos')
    op.drop_table('reviews')
    op.drop_table('appointments')
    op.drop_table('user_services')
    op.drop_table('services')
    op.drop_table('user_credentials')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_phone', table_name='users')
    op.drop_table('users')
    op.drop_table('organizations')
    op.drop_table('locations')

    # Drop enums
    for enum_name in [
        'organizationrole',
        'paymentstatus',
        'paymentmethod',
        'confirmationstatus',
        'servicecategory',
        'usertype',
    ]:
        try:
            sa.Enum(name=enum_name).drop(op.get_bind(), checkfirst=True)
        except Exception:
            pass


