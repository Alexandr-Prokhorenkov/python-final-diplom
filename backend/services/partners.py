from backend.models import ProductInfo, Shop
from backend.services.errors import ServiceError


def get_shop(user) -> Shop:
    shop = getattr(user, 'shop', None)
    if shop is None:
        raise ServiceError('Магазин ещё не создан. Сначала загрузите прайс.')
    return shop


def export_price_list(user) -> dict:
    """YAML-совместимый прайс магазина: тот же формат, что принимает импорт."""
    shop = get_shop(user)
    infos = (
        ProductInfo.objects.filter(shop=shop)
        .select_related('product')
        .prefetch_related('product_parameters__parameter')
        .order_by('external_id')
    )
    return {
        'shop': shop.name,
        'categories': [
            {'id': category.id, 'name': category.name}
            for category in shop.categories.order_by('id')
        ],
        'goods': [_export_good(info) for info in infos],
    }


def _export_good(info: ProductInfo) -> dict:
    parameters = {
        item.parameter.name: _yaml_scalar(item.value)
        for item in info.product_parameters.all()
    }
    return {
        'id': info.external_id,
        'category': info.product.category_id,
        'model': info.model,
        'name': info.product.name,
        'price': info.price,
        'price_rrc': info.price_rrc,
        'quantity': info.quantity,
        'parameters': parameters,
    }


def _yaml_scalar(value):
    text = str(value)
    try:
        if any(marker in text for marker in '.eE'):
            number = float(text)
            return int(number) if number.is_integer() else number
        return int(text)
    except ValueError:
        return text


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
