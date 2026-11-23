from rest_framework.permissions import BasePermission

from backend.models import UserType


class IsShopUser(BasePermission):
    """Доступ только для авторизованного пользователя-магазина."""

    message = 'Только для магазинов'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, 'type', None) == UserType.SHOP
        )


class IsBuyer(BasePermission):
    """Доступ только для авторизованного покупателя."""

    message = 'Только для покупателей'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, 'type', None) == UserType.BUYER
        )


class IsShopOrStaff(BasePermission):
    """Смена статуса заказа: сотрудник или поставщик."""

    message = 'Недостаточно прав для изменения статуса заказа'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'type', None) == UserType.SHOP)
        )
