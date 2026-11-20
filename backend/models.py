from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserType(models.TextChoices):
    SHOP = 'shop', 'Магазин'
    BUYER = 'buyer', 'Покупатель'


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
        default=False,
        help_text='Неактивный пользователь не может войти, пока не подтвердит email.',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ('email',)

    def __str__(self):
        full_name = self.get_full_name().strip()
        return full_name or self.email
