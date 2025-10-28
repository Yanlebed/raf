from app.db.base_class import Base  # Импортируем Base

# Импортируйте все модели здесь
from app.models.user import User
from app.models.user_credentials import UserCredentials
from app.models.service import Service
from app.models.appointment import Appointment
from app.models.review import Review
from app.models.master_photo import MasterPhoto
from app.models.master_schedule import MasterSchedule
from app.models.phone_verification import PhoneVerification
from app.models.associations import user_services
from app.models.organization import Organization
from app.models.user_organization import UserOrganization
from app.models.location import Location
from app.models.slot_hold import SlotHold

# Если есть ассоциативные таблицы или другие модели, убедитесь, что они тоже импортированы
