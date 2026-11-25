import secrets
from typing import TYPE_CHECKING, cast

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import F, Sum


class UserType(models.TextChoices):
    SHOP = 'shop', 'Магазин'
    BUYER = 'buyer', 'Покупатель'


class OrderStatus(models.TextChoices):
    BASKET = 'basket', 'Корзина'
    NEW = 'new', 'Новый'
    CONFIRMED = 'confirmed', 'Подтверждён'
    ASSEMBLED = 'assembled', 'Собран'
    SENT = 'sent', 'Отправлен'
    DELIVERED = 'delivered', 'Доставлен'
    CANCELED = 'canceled', 'Отменён'


class UserManager(BaseUserManager):
    """Создание пользователей с логином по email, без username."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Email обязателен для создания пользователя.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_active', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Суперпользователь должен иметь is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Суперпользователь должен иметь is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Пользователь сервиса: покупатель или поставщик, вход по email."""

    username = None
    email = models.EmailField('Email', unique=True)
    company = models.CharField('Компания', max_length=40, blank=True)
    position = models.CharField('Должность', max_length=40, blank=True)
    type = models.CharField(
        'Тип пользователя',
        max_length=5,
        choices=UserType.choices,
        default=UserType.BUYER,
    )
    is_active = models.BooleanField(
        'Активен',
        default=False,  # pyright: ignore[reportArgumentType]
        help_text='Неактивный пользователь не может войти, пока не подтвердит email.',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta(AbstractUser.Meta):
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ('email',)

    def __str__(self):
        full_name = self.get_full_name().strip()
        return full_name or cast(str, self.email)


class Shop(models.Model):
    """Магазин поставщика. state=False — приём заказов выключен."""

    name = models.CharField('Название', max_length=50)
    url = models.URLField('Ссылка на прайс', blank=True, null=True)
    user = models.OneToOneField(
        User,
        verbose_name='Владелец',
        related_name='shop',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    state = models.BooleanField(
        'Принимает заказы',
        default=True,  # pyright: ignore[reportArgumentType]
    )

    class Meta:
        verbose_name = 'Магазин'
        verbose_name_plural = 'Магазины'
        ordering = ('name',)

    def __str__(self):
        return cast(str, self.name)


class Category(models.Model):
    name = models.CharField('Название', max_length=40)
    shops = models.ManyToManyField(
        Shop,
        verbose_name='Магазины',
        related_name='categories',
        blank=True,
    )

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ('name',)

    def __str__(self):
        return cast(str, self.name)


class Product(models.Model):
    """Товар в общем каталоге. Цена и остаток живут в ProductInfo по магазинам."""

    name = models.CharField('Название', max_length=80)
    category = models.ForeignKey(
        Category,
        verbose_name='Категория',
        related_name='products',
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ('name',)

    def __str__(self):
        return cast(str, self.name)


class ProductInfo(models.Model):
    """Предложение магазина: цена, остаток и внешний id из YAML-прайса."""

    product = models.ForeignKey(
        Product,
        verbose_name='Товар',
        related_name='product_infos',
        on_delete=models.CASCADE,
    )
    shop = models.ForeignKey(
        Shop,
        verbose_name='Магазин',
        related_name='product_infos',
        on_delete=models.CASCADE,
    )
    external_id = models.PositiveIntegerField('Внешний ID')
    model = models.CharField('Модель', max_length=80, blank=True)
    quantity = models.PositiveIntegerField('Количество')
    price = models.PositiveIntegerField('Цена')
    price_rrc = models.PositiveIntegerField('Рекомендуемая розничная цена')

    class Meta:
        verbose_name = 'Предложение магазина'
        verbose_name_plural = 'Предложения магазинов'
        constraints = [
            models.UniqueConstraint(
                fields=('product', 'shop', 'external_id'),
                name='unique_product_info',
            ),
        ]

    def __str__(self):
        return f'{self.product} / {self.shop} ({self.price})'


class Parameter(models.Model):
    name = models.CharField('Название', max_length=40)

    class Meta:
        verbose_name = 'Характеристика'
        verbose_name_plural = 'Характеристики'
        ordering = ('name',)

    def __str__(self):
        return cast(str, self.name)


class ProductParameter(models.Model):
    product_info = models.ForeignKey(
        ProductInfo,
        verbose_name='Предложение',
        related_name='product_parameters',
        on_delete=models.CASCADE,
    )
    parameter = models.ForeignKey(
        Parameter,
        verbose_name='Характеристика',
        related_name='product_parameters',
        on_delete=models.CASCADE,
    )
    value = models.CharField('Значение', max_length=100)

    class Meta:
        verbose_name = 'Значение характеристики'
        verbose_name_plural = 'Значения характеристик'
        constraints = [
            models.UniqueConstraint(
                fields=('product_info', 'parameter'),
                name='unique_product_parameter',
            ),
        ]

    def __str__(self):
        return f'{self.parameter}: {self.value}'


class Contact(models.Model):
    """Адрес доставки покупателя."""

    user = models.ForeignKey(
        User,
        verbose_name='Пользователь',
        related_name='contacts',
        on_delete=models.CASCADE,
    )
    city = models.CharField('Город', max_length=50)
    street = models.CharField('Улица', max_length=100)
    house = models.CharField('Дом', max_length=15, blank=True)
    structure = models.CharField('Корпус', max_length=15, blank=True)
    building = models.CharField('Строение', max_length=15, blank=True)
    apartment = models.CharField('Квартира', max_length=15, blank=True)
    phone = models.CharField('Телефон', max_length=20)

    class Meta:
        verbose_name = 'Контакт'
        verbose_name_plural = 'Контакты'

    def __str__(self):
        parts = [cast(str, self.city), cast(str, self.street), cast(str, self.house)]
        return ' '.join(part for part in parts if part)


class Order(models.Model):
    """Корзина — заказ со статусом basket. После подтверждения статус new."""

    user = models.ForeignKey(
        User,
        verbose_name='Пользователь',
        related_name='orders',
        on_delete=models.CASCADE,
    )
    dt = models.DateTimeField('Создан', auto_now_add=True)
    state = models.CharField(
        'Статус',
        max_length=15,
        choices=OrderStatus.choices,
        default=OrderStatus.BASKET,
    )
    contact = models.ForeignKey(
        Contact,
        verbose_name='Адрес доставки',
        related_name='orders',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    if TYPE_CHECKING:
        ordered_items: models.QuerySet['OrderItem']

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ('-dt',)

    def __str__(self):
        state = OrderStatus(cast(str, self.state))
        return f'Заказ #{self.pk} ({state.label})'

    @property
    def total_sum(self):
        total = self.ordered_items.aggregate(
            total=Sum(F('price') * F('quantity')),
        )['total']
        return total or 0


class OrderItem(models.Model):
    """Позиция заказа. price копируется с ProductInfo, чтобы прайс не переписывал историю."""

    order = models.ForeignKey(
        Order,
        verbose_name='Заказ',
        related_name='ordered_items',
        on_delete=models.CASCADE,
    )
    product_info = models.ForeignKey(
        ProductInfo,
        verbose_name='Предложение',
        related_name='ordered_items',
        on_delete=models.CASCADE,
    )
    quantity = models.PositiveIntegerField('Количество')
    price = models.PositiveIntegerField('Цена на момент заказа')

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказа'
        constraints = [
            models.UniqueConstraint(
                fields=('order', 'product_info'),
                name='unique_order_item',
            ),
        ]

    def __str__(self):
        return f'{self.product_info} × {self.quantity}'

    def save(self, *args, **kwargs):
        # В админке price readonly и не приходит в POST — берём цену предложения.
        offer = cast(ProductInfo | None, self.product_info)
        if self.price in (None, '') and offer is not None:
            self.price = cast(int, offer.price)
        super().save(*args, **kwargs)

    @property
    def cost(self) -> int:
        return cast(int, self.price) * cast(int, self.quantity)


class ConfirmEmailToken(models.Model):
    """Токен подтверждения email при регистрации."""

    user = models.ForeignKey(
        User,
        verbose_name='Пользователь',
        related_name='confirm_email_tokens',
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    key = models.CharField('Ключ', max_length=64, unique=True, db_index=True)

    class Meta:
        verbose_name = 'Токен подтверждения email'
        verbose_name_plural = 'Токены подтверждения email'

    def __str__(self):
        return f'Токен для {self.user}'

    @staticmethod
    def generate_key():
        return secrets.token_hex(32)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        super().save(*args, **kwargs)
