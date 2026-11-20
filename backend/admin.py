from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from backend.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Админка пользователя с входом по email вместо username."""

    model = User
    list_display = ('email', 'first_name', 'last_name', 'type', 'is_active', 'is_staff')
    list_filter = ('type', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name', 'company')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions')

    fieldsets = (
        (None, {'fields': ('email', 'password', 'type')}),
        ('Личные данные', {'fields': ('first_name', 'last_name', 'company', 'position')}),
        ('Права', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Даты', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'type',
                'is_active',
                'is_staff',
                'is_superuser',
            ),
        }),
    )
