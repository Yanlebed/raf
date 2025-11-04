"""initial consolidated schema

Revision ID: 20251027_0001
Revises: 
Create Date: 2025-10-27 02:30:00

"""

from alembic import op
import sqlalchemy as sa


revision = '20251027_0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:

    # locations
    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('city', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
    )
    op.create_index('ix_locations_city', 'locations', ['city'])
    op.create_unique_constraint('uq_locations_city_addr_coords', 'locations', ['city', 'address', 'latitude', 'longitude'])

    # organizations
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
    )

    # users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_type', sa.Enum('MASTER', 'CLIENT', 'SALON', 'ADMIN', name='usertype', create_type=True), nullable=False),
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
        sa.Column('facebook_url', sa.String(), nullable=True),
        sa.Column('instagram_url', sa.String(), nullable=True),
        sa.Column('tiktok_url', sa.String(), nullable=True),
        sa.Column('telegram_url', sa.String(), nullable=True),
        sa.Column('whatsapp', sa.String(), nullable=True),
        sa.Column('viber', sa.String(), nullable=True),
    )
    op.create_index('ix_users_phone', 'users', ['phone'], unique=True)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # user_organizations
    op.create_table(
        'user_organizations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('organization_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
    )
    op.create_unique_constraint('uq_user_organizations_user_org', 'user_organizations', ['user_id', 'organization_id'])
    op.create_index('ix_user_orgs_org', 'user_organizations', ['organization_id'])

    # services
    op.create_table(
        'services',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('category', sa.Enum('Стрижка', 'Маникюр', name='servicecategory', create_type=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('owner_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('owner_org_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=True),
    )
    op.create_check_constraint('ck_services_owner_required', 'services', '(owner_user_id IS NOT NULL) OR (owner_org_id IS NOT NULL)')
    op.create_index('ix_services_owner_user', 'services', ['owner_user_id'])
    op.create_index('ix_services_owner_org', 'services', ['owner_org_id'])

    # user_services association
    op.create_table(
        'user_services',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), nullable=False),
    )
    op.create_primary_key('pk_user_services', 'user_services', ['user_id', 'service_id'])

    # appointments
    op.create_table(
        'appointments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), nullable=False),
        sa.Column('appointment_code', sa.String(), unique=True, nullable=True),
        sa.Column('appointment_date', sa.DateTime(), nullable=False),
        sa.Column('confirmation_status', sa.Enum('Ожидает подтверждения', 'Подтверждена', 'Отменена клиентом', 'Отменена мастером', 'Завершена', name='confirmationstatus', create_type=True), nullable=True),
        sa.Column('payment_method', sa.Enum('Наличные', 'Карта', 'Онлайн-оплата', name='paymentmethod', create_type=True), nullable=True),
        sa.Column('payment_status', sa.Enum('Оплачено', 'Не оплачено', 'Частично оплачено', name='paymentstatus', create_type=True), nullable=True),
        sa.Column('client_notes', sa.Text(), nullable=True),
        sa.Column('master_notes', sa.Text(), nullable=True),
        sa.Column('service_location', sa.String(), nullable=True),
        sa.Column('reminders', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('duration_override', sa.Integer(), nullable=True),
    )
    op.create_index('ix_appointments_master_date', 'appointments', ['master_id', 'appointment_date'])

    # reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('salon_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('anonymous', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_reviews_master', 'reviews', ['master_id'])
    op.create_index('ix_reviews_salon', 'reviews', ['salon_id'])
    op.create_index('ix_reviews_client', 'reviews', ['client_id'])

    # master_photos
    op.create_table(
        'master_photos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('photo_url', sa.String(), nullable=False),
    )

    # master_schedule
    op.create_table(
        'master_schedule',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
    )

    # phone_verifications
    op.create_table(
        'phone_verifications',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('verification_code', sa.String(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=False),
    )

    # slot_holds
    op.create_table(
        'slot_holds',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('master_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), nullable=False),
        sa.Column('start_time', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('end_time', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    # otp_attempts
    op.create_table(
        'otp_attempts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_otp_attempts_phone_created', 'otp_attempts', ['phone_number', 'created_at'])

    # refresh_tokens
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('jti', sa.String(), nullable=False, unique=True),
        sa.Column('revoked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_refresh_tokens_user', 'refresh_tokens', ['user_id'])
    op.create_index('ix_refresh_tokens_jti', 'refresh_tokens', ['jti'])


def downgrade() -> None:
    op.drop_index('ix_refresh_tokens_jti', table_name='refresh_tokens')
    op.drop_index('ix_refresh_tokens_user', table_name='refresh_tokens')
    op.drop_table('refresh_tokens')
    op.drop_index('ix_otp_attempts_phone_created', table_name='otp_attempts')
    op.drop_table('otp_attempts')
    op.drop_table('slot_holds')
    op.drop_table('phone_verifications')
    op.drop_table('master_schedule')
    op.drop_table('master_photos')
    op.drop_index('ix_reviews_client', table_name='reviews')
    op.drop_index('ix_reviews_salon', table_name='reviews')
    op.drop_index('ix_reviews_master', table_name='reviews')
    op.drop_table('reviews')
    op.drop_index('ix_appointments_master_date', table_name='appointments')
    op.drop_table('appointments')
    op.drop_constraint('pk_user_services', 'user_services', type_='primary')
    op.drop_table('user_services')
    op.drop_index('ix_services_owner_org', table_name='services')
    op.drop_index('ix_services_owner_user', table_name='services')
    op.drop_constraint('ck_services_owner_required', 'services', type_='check')
    op.drop_table('services')
    op.drop_index('ix_user_orgs_org', table_name='user_organizations')
    op.drop_constraint('uq_user_organizations_user_org', 'user_organizations', type_='unique')
    op.drop_table('user_organizations')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_phone', table_name='users')
    op.drop_table('users')
    op.drop_table('organizations')
    op.drop_constraint('uq_locations_city_addr_coords', 'locations', type_='unique')
    op.drop_index('ix_locations_city', table_name='locations')
    op.drop_table('locations')
    for enum_name in ['paymentstatus', 'paymentmethod', 'confirmationstatus', 'servicecategory', 'usertype']:
        try:
            sa.Enum(name=enum_name).drop(op.get_bind(), checkfirst=True)
        except Exception:
            pass


