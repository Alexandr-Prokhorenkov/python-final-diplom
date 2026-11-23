"""Импорт прайса магазина из YAML: разбор файла и запись в модели."""

from pathlib import Path

import requests
import yaml
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.db import transaction

from backend.models import (
    Category,
    Parameter,
    Product,
    ProductInfo,
    ProductParameter,
    Shop,
    User,
    UserType,
)

_REQUIRED_ROOT = {'shop', 'categories', 'goods'}
_REQUIRED_CATEGORY = {'id', 'name'}
_REQUIRED_GOOD = {'id', 'category', 'name', 'price', 'price_rrc', 'quantity'}


class PriceListError(Exception):
    """Некорректный прайс или ошибка загрузки."""


def import_price_list_from_path(*, user: User, path: str | Path) -> dict:
    yaml_path = Path(path)
    if not yaml_path.is_file():
        raise PriceListError(f'Файл не найден: {yaml_path}')
    return import_price_list_from_yaml(
        user=user,
        content=yaml_path.read_bytes(),
    )


def import_price_list_from_url(*, user: User, url: str) -> dict:
    validator = URLValidator()
    try:
        validator(url)
    except ValidationError as exc:
        raise PriceListError(str(exc)) from exc

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise PriceListError(f'Не удалось скачать прайс: {exc}') from exc

    stats = import_price_list_from_yaml(user=user, content=response.content)
    shop = user.shop
    shop.url = url
    shop.save(update_fields=['url'])
    return stats


def import_price_list_from_yaml(*, user: User, content: str | bytes) -> dict:
    data = _parse_yaml(content)
    return import_price_list(user=user, data=data)


@transaction.atomic
def import_price_list(*, user: User, data: dict) -> dict:
    """
    Обновляет каталог магазина пользователя.

    Категории и товары создаются или обновляются (upsert).
    Предложения, которых больше нет в прайсе, удаляются, если на них нет заказов;
    иначе остаток обнуляется, чтобы не ломать историю заказов.
    """
    _ensure_shop_user(user)
    payload = _validate_payload(data)
    shop = _sync_shop(user, payload['shop'])
    _sync_categories(shop, payload['categories'])
    stats = _sync_goods(shop, payload['goods'])
    stats['shop'] = shop.name
    return stats


def _parse_yaml(content: str | bytes) -> dict:
    try:
        data = yaml.safe_load(content)
    except yaml.YAMLError as exc:
        raise PriceListError(f'Некорректный YAML: {exc}') from exc
    if not isinstance(data, dict):
        raise PriceListError('В корне YAML должен быть объект.')
    return data


def _ensure_shop_user(user: User) -> None:
    if user.type != UserType.SHOP:
        raise PriceListError('Импорт прайса доступен только пользователю типа shop.')


def _validate_payload(data: dict) -> dict:
    missing = _REQUIRED_ROOT - set(data)
    if missing:
        raise PriceListError(f'В прайсе нет полей: {", ".join(sorted(missing))}')
    if not data['shop']:
        raise PriceListError('Не указано название магазина.')
    if not isinstance(data['categories'], list) or not data['categories']:
        raise PriceListError('Список категорий пуст.')
    if not isinstance(data['goods'], list) or not data['goods']:
        raise PriceListError('Список товаров пуст.')

    for category in data['categories']:
        _require_keys(category, _REQUIRED_CATEGORY, 'категории')
    for item in data['goods']:
        _require_keys(item, _REQUIRED_GOOD, 'товара')
        if not isinstance(item.get('parameters', {}), dict):
            raise PriceListError(f'parameters товара {item["id"]} должны быть объектом.')
    return data


def _require_keys(item: dict, required: set, label: str) -> None:
    if not isinstance(item, dict):
        raise PriceListError(f'Некорректная запись {label}.')
    missing = required - set(item)
    if missing:
        raise PriceListError(f'В записи {label} нет полей: {", ".join(sorted(missing))}')


def _sync_shop(user: User, shop_name: str) -> Shop:
    shop = Shop.objects.filter(user=user).first()
    if shop:
        if shop.name != shop_name:
            shop.name = shop_name
            shop.save(update_fields=['name'])
        return shop
    return Shop.objects.create(name=shop_name, user=user)


def _sync_categories(shop: Shop, categories: list[dict]) -> None:
    for item in categories:
        category, _ = Category.objects.update_or_create(
            pk=item['id'],
            defaults={'name': item['name']},
        )
        category.shops.add(shop)


def _sync_goods(shop: Shop, goods: list[dict]) -> dict:
    imported_ids: list[int] = []
    created_count = 0
    updated_count = 0

    for item in goods:
        if not Category.objects.filter(pk=item['category']).exists():
            raise PriceListError(
                f'Товар {item["id"]} ссылается на неизвестную категорию {item["category"]}.'
            )

        product, _ = Product.objects.get_or_create(
            name=item['name'],
            defaults={'category_id': item['category']},
        )
        if product.category_id != item['category']:
            product.category_id = item['category']
            product.save(update_fields=['category_id'])

        product_info, created = ProductInfo.objects.update_or_create(
            shop=shop,
            external_id=item['id'],
            defaults={
                'product': product,
                'model': item.get('model') or '',
                'price': item['price'],
                'price_rrc': item['price_rrc'],
                'quantity': item['quantity'],
            },
        )
        _sync_parameters(product_info, item.get('parameters') or {})
        imported_ids.append(item['id'])
        if created:
            created_count += 1
        else:
            updated_count += 1

    stale_qs = ProductInfo.objects.filter(shop=shop).exclude(external_id__in=imported_ids)
    deleted_count = 0
    deactivated_count = 0
    for stale in stale_qs:
        if stale.ordered_items.exists():
            stale.quantity = 0
            stale.save(update_fields=['quantity'])
            deactivated_count += 1
        else:
            stale.delete()
            deleted_count += 1

    return {
        'created': created_count,
        'updated': updated_count,
        'deleted': deleted_count,
        'deactivated': deactivated_count,
    }


def _sync_parameters(product_info: ProductInfo, parameters: dict) -> None:
    keep_ids: list[int] = []
    for name, value in parameters.items():
        parameter, _ = Parameter.objects.get_or_create(name=str(name))
        ProductParameter.objects.update_or_create(
            product_info=product_info,
            parameter=parameter,
            defaults={'value': str(value)},
        )
        keep_ids.append(parameter.id)
    ProductParameter.objects.filter(product_info=product_info).exclude(
        parameter_id__in=keep_ids,
    ).delete()
