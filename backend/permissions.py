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
