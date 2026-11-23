from backend.models import Shop
from backend.services.errors import ServiceError


def get_shop(user) -> Shop:
    shop = getattr(user, 'shop', None)
    if shop is None:
        raise ServiceError('Магазин ещё не создан. Сначала загрузите прайс.')
    return shop


def set_shop_state(user, state) -> Shop:
    shop = get_shop(user)
    shop.state = _as_bool(state)
    shop.save(update_fields=['state'])
    return shop


def _as_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        raise ServiceError('Укажите state')
    normalized = str(value).strip().lower()
    if normalized in {'1', 'true', 'yes', 'on'}:
        return True
    if normalized in {'0', 'false', 'no', 'off'}:
        return False
    raise ServiceError('Некорректное значение state')
