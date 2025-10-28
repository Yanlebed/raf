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
