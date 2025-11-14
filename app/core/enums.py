from enum import Enum

class UserType(str, Enum):
    MASTER = "MASTER"
    CLIENT = "CLIENT"
    SALON = "SALON"
    ADMIN = "ADMIN"

class UserStatus(str, Enum):
    ACTIVE = "Активный"
    DELETED = "Удален"
    UNCONFIRMED = "Не подтвержден"
    BLOCKED = "Заблокирован"


class OrganizationRole(str, Enum):
    OWNER = "OWNER"
    MANAGER = "MANAGER"
    MASTER = "MASTER"


class ServiceCategory(str, Enum):
    HAIRCUT = "Стрижка"
    MANICURE = "Маникюр"


class City(str, Enum):
    KYIV = "Kyiv"
    LVIV = "Lviv"
    ODESA = "Odesa"


class ConfirmationStatus(str, Enum):
    PENDING = "Ожидает подтверждения"
    CONFIRMED = "Подтверждена"
    CANCELED_BY_CLIENT = "Отменена клиентом"
    CANCELED_BY_MASTER = "Отменена мастером"
    COMPLETED = "Завершена"


class PaymentMethod(str, Enum):
    CASH = "Наличные"
    CARD = "Карта"
    ONLINE = "Онлайн-оплата"


class PaymentStatus(str, Enum):
    PAID = "Оплачено"
    NOT_PAID = "Не оплачено"
    PARTIALLY_PAID = "Частично оплачено"
