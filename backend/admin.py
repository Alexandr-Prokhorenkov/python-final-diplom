from pathlib import Path

from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import path, reverse

from django.conf import settings as django_settings

from backend.forms import PriceImportForm
from backend.models import (
    Category,
    ConfirmEmailToken,
    Contact,
    Order,
    OrderItem,
    OrderStatus,
    Parameter,
    Product,
    ProductInfo,
    ProductParameter,
    Shop,
    User,
    UserType,
)
from backend.services.importer import PriceListError
from backend.services.orders import notify_order_status_changed
from backend.tasks import do_import

admin.site.site_header = 'Админка склада'
admin.site.site_title = 'Заказы'
admin.site.index_title = 'Склад, прайсы и заказы'


def _is_shop_staff(user) -> bool:
    return bool(
        user
        and not user.is_superuser
        and getattr(user, 'type', None) == UserType.SHOP
    )


class ShopOrderFilter(admin.SimpleListFilter):
    title = 'Магазин'
    parameter_name = 'shop'

    def lookups(self, request, model_admin):
        shops = Shop.objects.all()
        if _is_shop_staff(request.user):
            shops = shops.filter(user=request.user)
        return [(shop.id, shop.name) for shop in shops]

    def queryset(self, request, queryset):
        if not self.value():
            return queryset
        return queryset.filter(
            ordered_items__product_info__shop_id=self.value(),
        ).distinct()


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
    list_editable = ('state',)
    search_fields = ('name', 'user__email')
    autocomplete_fields = ('user',)
    actions = ('queue_price_import',)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if _is_shop_staff(request.user):
            return queryset.filter(user=request.user)
        return queryset

    def get_urls(self):
        urls = super().get_urls()
        extra = [
            path(
                '<path:object_id>/import-price/',
                self.admin_site.admin_view(self.import_price_view),
                name='backend_shop_import_price',
            ),
        ]
        return extra + urls

    def import_price_view(self, request, object_id):
        shop = get_object_or_404(self.get_queryset(request), pk=object_id)
        if request.method == 'POST':
            form = PriceImportForm(request.POST, request.FILES)
            if form.is_valid():
                try:
                    result = self._queue_import(shop, form.cleaned_data)
                except PriceListError as exc:
                    messages.error(request, str(exc))
                else:
                    if result is None:
                        messages.success(
                            request,
                            'Импорт поставлен в очередь Celery. '
                            'Запустите: celery -A orders_service worker -l info',
                        )
                    else:
                        messages.success(
                            request,
                            'Импорт «{shop}»: создано {created}, обновлено {updated}, '
                            'удалено {deleted}, обнулено {deactivated}.'.format(**result),
                        )
                    return redirect(
                        reverse('admin:backend_shop_change', args=[shop.pk]),
                    )
        else:
            form = PriceImportForm()
        return render(
            request,
            'admin/backend/shop/import_price.html',
            {
                **self.admin_site.each_context(request),
                'opts': self.model._meta,
                'shop': shop,
                'form': form,
                'title': f'Импорт прайса: {shop}',
            },
        )

    @admin.action(description='Импортировать прайс')
    def queue_price_import(self, request, queryset):
        queued = 0
        for shop in queryset:
            if not shop.user_id:
                messages.warning(request, f'«{shop}»: нет владельца, пропуск.')
                continue
            if not shop.url:
                messages.warning(
                    request,
                    f'«{shop}»: нет URL. Откройте карточку и загрузите YAML-файл.',
                )
                continue
            self._delay_import(user_id=shop.user_id, url=shop.url)
            queued += 1
        if queued:
            messages.success(request, f'В очередь импорта поставлено магазинов: {queued}.')

    def _queue_import(self, shop: Shop, cleaned_data: dict) -> dict | None:
        if not shop.user_id:
            raise PriceListError('У магазина нет владельца — назначьте пользователя type=shop.')
        yaml_file = cleaned_data.get('yaml_file')
        yaml_url = cleaned_data.get('yaml_url')
        if yaml_file:
            imports_dir = django_settings.BASE_DIR / 'media' / 'imports'
            imports_dir.mkdir(parents=True, exist_ok=True)
            filename = Path(yaml_file.name).name
            path = imports_dir / f'{shop.pk}_{filename}'
            path.write_bytes(yaml_file.read())
            async_result = self._delay_import(user_id=shop.user_id, path=str(path))
        else:
            async_result = self._delay_import(user_id=shop.user_id, url=yaml_url)
        if django_settings.CELERY_TASK_ALWAYS_EAGER:
            return async_result.get()
        return None

    @staticmethod
    def _delay_import(*, user_id: int, url: str | None = None, path: str | None = None):
        return do_import.delay(user_id, url=url, path=path)


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
    list_editable = ('price', 'quantity')
    list_filter = ('shop',)
    search_fields = ('product__name', 'model', 'shop__name')
    list_select_related = ('product', 'shop')
    inlines = (ProductParameterInline,)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if _is_shop_staff(request.user):
            return queryset.filter(shop__user=request.user)
        return queryset


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
    autocomplete_fields = ('product_info',)
    readonly_fields = ('price',)
    verbose_name_plural = 'Позиции (цена подставится из предложения при сохранении)'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'state', 'dt', 'contact', 'total_sum')
    list_filter = ('state', ShopOrderFilter, 'dt')
    date_hierarchy = 'dt'
    search_fields = ('user__email', 'id')
    list_select_related = ('user', 'contact')
    autocomplete_fields = ('user', 'contact')
    inlines = (OrderItemInline,)
    readonly_fields = ('dt', 'total_sum')
    fields = ('user', 'state', 'contact', 'dt', 'total_sum')

    def get_queryset(self, request):
        queryset = super().get_queryset(request).prefetch_related(
            'ordered_items__product_info__shop',
        )
        if _is_shop_staff(request.user):
            return queryset.filter(
                ordered_items__product_info__shop__user=request.user,
            ).exclude(state=OrderStatus.BASKET).distinct()
        return queryset

    def save_model(self, request, obj, form, change):
        previous_state = form.initial.get('state') if change else None
        super().save_model(request, obj, form, change)
        if (
            change
            and previous_state
            and previous_state != obj.state
            and obj.state != OrderStatus.BASKET
        ):
            notify_order_status_changed(obj, previous_state)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_info', 'quantity', 'price')
    search_fields = ('product_info__product__name',)
    list_select_related = ('order', 'product_info')


@admin.register(ConfirmEmailToken)
class ConfirmEmailTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'created_at')
    search_fields = ('user__email', 'key')
    readonly_fields = ('key', 'created_at')
