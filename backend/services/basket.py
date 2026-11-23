from django.db import transaction
from backend.models import Order, OrderItem, OrderStatus, ProductInfo
from backend.services.errors import ServiceError

BASKET_PREFETCH = (
    'ordered_items__product_info__product__category',
    'ordered_items__product_info__product_parameters__parameter',
    'ordered_items__product_info__shop',
    'contact',
)


def get_or_create_basket(user) -> Order:
    basket, _ = Order.objects.get_or_create(user=user, state=OrderStatus.BASKET)
    return basket


def get_basket(user) -> Order:
    basket = get_or_create_basket(user)
    return (
        Order.objects.filter(pk=basket.pk)
        .prefetch_related(*BASKET_PREFETCH)
        .first()
    )


def add_items(user, data) -> int:
    items = _items_from_payload(data, require_product_info=True)
    created = 0
    with transaction.atomic():
        basket = get_or_create_basket(user)
        for item in items:
            product_info = _lock_offer(item['product_info'])
            quantity = item['quantity']
            _validate_offer(product_info, quantity)
            existing = OrderItem.objects.filter(
                order=basket, product_info=product_info,
            ).first()
            if existing:
                new_qty = existing.quantity + quantity
                _validate_offer(product_info, new_qty)
                existing.quantity = new_qty
                existing.price = product_info.price
                existing.save(update_fields=['quantity', 'price'])
            else:
                OrderItem.objects.create(
                    order=basket,
                    product_info=product_info,
                    quantity=quantity,
                    price=product_info.price,
                )
                created += 1
    return created


def update_items(user, data) -> int:
    items = _items_from_payload(data, require_item_id=True)
    updated = 0
    with transaction.atomic():
        basket = get_or_create_basket(user)
        for item in items:
            order_item = OrderItem.objects.filter(
                order=basket, id=item['id'],
            ).select_related('product_info__shop').first()
            if not order_item:
                continue
            _validate_offer(order_item.product_info, item['quantity'])
            order_item.quantity = item['quantity']
            order_item.price = order_item.product_info.price
            order_item.save(update_fields=['quantity', 'price'])
            updated += 1
    return updated


def delete_items(user, data) -> int:
    ids = _delete_ids(data)
    if not ids:
        raise ServiceError('Укажите id позиций для удаления')
    basket = get_or_create_basket(user)
    deleted, _ = OrderItem.objects.filter(order=basket, id__in=ids).delete()
    return deleted


def _lock_offer(product_info_id: int) -> ProductInfo:
    offer = (
        ProductInfo.objects.select_for_update()
        .select_related('shop')
        .filter(pk=product_info_id)
        .first()
    )
    if not offer:
        raise ServiceError('Товар не найден', status_code=404)
    return offer


def _validate_offer(offer: ProductInfo, quantity: int) -> None:
    if quantity < 1:
        raise ServiceError('Количество должно быть больше нуля')
    if not offer.shop.state:
        raise ServiceError(f'Магазин «{offer.shop.name}» не принимает заказы')
    if quantity > offer.quantity:
        raise ServiceError(
            f'Недостаточно товара «{offer.product}»: в наличии {offer.quantity}'
        )


def _items_from_payload(data, *, require_product_info=False, require_item_id=False) -> list[dict]:
    raw = data.get('items', data)
    if isinstance(raw, str):
        import json
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ServiceError('Неверный формат items') from exc
    if isinstance(raw, dict):
        raw = [raw]
    if not isinstance(raw, list) or not raw:
        raise ServiceError('Не указаны позиции')

    items = []
    for row in raw:
        if not isinstance(row, dict):
            raise ServiceError('Неверный формат позиции')
        quantity = _as_positive_int(row.get('quantity'), 'quantity')
        item = {'quantity': quantity}
        if require_product_info:
            item['product_info'] = _as_positive_int(
                row.get('product_info') or row.get('product_info_id'),
                'product_info',
            )
        if require_item_id:
            item['id'] = _as_positive_int(row.get('id'), 'id')
        items.append(item)
    return items


def _delete_ids(data) -> list[int]:
    raw = data.get('items', data.get('id'))
    if raw is None:
        return []
    if isinstance(raw, list):
        values = raw
    else:
        values = str(raw).split(',')
    ids = []
    for value in values:
        value = str(value).strip()
        if value:
            ids.append(_as_positive_int(value, 'id'))
    return ids


def _as_positive_int(value, field: str) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise ServiceError(f'Некорректное значение {field}') from None
    if number < 1:
        raise ServiceError(f'{field} должен быть больше нуля')
    return number
