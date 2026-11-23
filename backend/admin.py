from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from backend.models import (
    Category,
    ConfirmEmailToken,
    Contact,
    Order,
    OrderItem,
    Parameter,
    Product,
    ProductInfo,
    ProductParameter,
    Shop,
    User,
)


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


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'state', 'url')
    list_filter = ('state',)
    search_fields = ('name',)


class ProductInline(admin.TabularInline):
    model = Product
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    filter_horizontal = ('shops',)
    inlines = (ProductInline,)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)


class ProductParameterInline(admin.TabularInline):
    model = ProductParameter
    extra = 0


@admin.register(ProductInfo)
class ProductInfoAdmin(admin.ModelAdmin):
    list_display = ('product', 'shop', 'external_id', 'price', 'quantity')
    list_filter = ('shop',)
    search_fields = ('product__name', 'model')
    inlines = (ProductParameterInline,)


@admin.register(Parameter)
class ParameterAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(ProductParameter)
class ProductParameterAdmin(admin.ModelAdmin):
    list_display = ('product_info', 'parameter', 'value')
    search_fields = ('parameter__name', 'value')


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'street', 'house', 'phone')
    search_fields = ('user__email', 'city', 'phone')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'state', 'dt', 'contact')
    list_filter = ('state',)
    search_fields = ('user__email',)
    inlines = (OrderItemInline,)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_info', 'quantity', 'price')
    search_fields = ('product_info__product__name',)


@admin.register(ConfirmEmailToken)
class ConfirmEmailTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'created_at')
    search_fields = ('user__email', 'key')
    readonly_fields = ('key', 'created_at')
