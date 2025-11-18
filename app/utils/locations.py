from typing import Optional

from app.core.enums import City


# Map various user-facing labels (including Ukrainian and legacy spellings)
# to canonical City enum values.
_CITY_ALIASES = {
    # Kyiv
    "kyiv": City.KYIV,
    "київ": City.KYIV,
    "kiev": City.KYIV,
    # Lviv
    "lviv": City.LVIV,
    "львів": City.LVIV,
    # Odesa
    "odesa": City.ODESA,
    "одеса": City.ODESA,
    "odessa": City.ODESA,
}


def normalize_city_label(raw: Optional[str]) -> Optional[str]:
    """
    Normalize a user-provided city label to a canonical value.

    - Returns None for empty/None input.
    - Returns the canonical City value (e.g. 'Kyiv') for known aliases.
    - Returns the original trimmed string for unknown cities so the system
      still supports new locations without code changes.
    """
    if not raw:
        return None
    key = raw.strip()
    if not key:
        return None
    alias = _CITY_ALIASES.get(key.lower())
    return alias.value if alias else key


