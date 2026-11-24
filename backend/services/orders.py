from django.conf import settings
from django.db import transaction
from django.db.models import F

from backend.models import Contact, Order, OrderItem, OrderStatus, ProductInfo, UserType
from backend.services.basket import BASKET_PREFETCH
from backend.services.email import send_notification
from backend.services.errors import ServiceError


def list_user_orders(user):
    return (
        Order.objects.filter(user=user)
        .exclude(state=OrderStatus.BASKET)
        .prefetch_related(*BASKET_PREFETCH)
        .select_related('contact')
    )


def get_user_order(user, order_id: int) -> Order:
    order = (
        Order.objects.filter(pk=order_id, user=user)
        .exclude(state=OrderStatus.BASKET)
        .prefetch_related(*BASKET_PREFETCH)
        .select_related('contact')
        .first()
    )
    if not order:
        raise ServiceError('Заказ не найден', status_code=404)
    return order


def confirm_order(user, *, order_id, contact_id) -> Order:
    if not order_id or not contact_id:
        raise ServiceError('Укажите id корзины и contact')

    with transaction.atomic():
        order = (
            Order.objects.select_for_update()
            .filter(pk=int(order_id), user=user, state=OrderStatus.BASKET)
            .first()
        )
        if not order:
            raise ServiceError('Корзина не найдена')
        if not order.ordered_items.exists():
            raise ServiceError('Корзина пуста')

        contact = Contact.objects.filter(pk=int(contact_id), user=user).first()
        if not contact:
            raise ServiceError('Контакт не найден')

        items = list(
            OrderItem.objects.select_for_update()
            .select_related('product_info__shop', 'product_info__product')
            .filter(order=order)
        )
        for item in items:
            offer = ProductInfo.objects.select_for_update().select_related('shop', 'product').get(
                pk=item.product_info_id,
            )
            if not offer.shop.state:
                raise ServiceError(f'Магазин «{offer.shop.name}» не принимает заказы')
            if item.quantity > offer.quantity:
                raise ServiceError(
                    f'Недостаточно товара «{offer.product}»: в наличии {offer.quantity}'
                )
            offer.quantity = F('quantity') - item.quantity
            offer.save(update_fields=['quantity'])

        order.contact = contact
        order.state = OrderStatus.NEW
        order.save(update_fields=['contact', 'state'])

    order = (
        Order.objects.filter(pk=order.pk)
        .prefetch_related(*BASKET_PREFETCH)
        .select_related('contact', 'user')
        .first()
    )
    _notify_new_order(order)
    return order


def update_order_status(user, order_id, state: str) -> Order:
    if state not in OrderStatus.values or state == OrderStatus.BASKET:
        raise ServiceError('Некорректный статус заказа')

    queryset = Order.objects.exclude(state=OrderStatus.BASKET).prefetch_related(*BASKET_PREFETCH)
    if user.is_staff:
        order = queryset.filter(pk=order_id).first()
    elif user.type == UserType.SHOP:
        order = queryset.filter(
            pk=order_id,
            ordered_items__product_info__shop__user=user,
        ).distinct().first()
    else:
        raise ServiceError('Недостаточно прав', status_code=403)

    if not order:
        raise ServiceError('Заказ не найден', status_code=404)

    previous = order.state
    if previous == state:
        return order

    order.state = state
    order.save(update_fields=['state'])
    notify_order_status_changed(order, previous)
    return order


def notify_order_status_changed(order: Order, previous_state: str) -> None:
    """Письмо клиенту при смене статуса — одно и то же для API и админки."""
    if previous_state == order.state:
        return
    send_notification(
        subject=f'Статус заказа №{order.id} изменён',
        message=(
            f'Заказ №{order.id}: статус «{OrderStatus(previous_state).label}» '
            f'изменён на «{order.get_state_display()}».'
        ),
        recipients=[order.user.email],
    )


def list_partner_orders(user):
    return (
        Order.objects.filter(ordered_items__product_info__shop__user=user)
        .exclude(state=OrderStatus.BASKET)
        .prefetch_related(*BASKET_PREFETCH)
        .select_related('contact')
        .distinct()
    )


def _notify_new_order(order: Order) -> None:
    lines = [
        f'Заказ №{order.id} принят.',
        f'Сумма: {order.total_sum}',
        f'Адрес: {order.contact}',
        'Позиции:',
    ]
    for item in order.ordered_items.all():
        lines.append(
            f'- {item.product_info.product} / {item.product_info.shop}: '
            f'{item.quantity} × {item.price}'
        )
    body = '\n'.join(lines)
    send_notification(
        subject=f'Заказ №{order.id} принят',
        message=body,
        recipients=[order.user.email],
    )
    send_notification(
        subject=f'Накладная заказа №{order.id}',
        message=body,
        recipients=[settings.ADMIN_EMAIL],
    )
