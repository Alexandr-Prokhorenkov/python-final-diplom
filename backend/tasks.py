from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from backend.services.importer import PriceListError, import_price_list_from_path, import_price_list_from_url


@shared_task
def send_email(subject: str, message: str, recipients: list[str]) -> int:
    """Отправка письма. В eager-режиме выполняется сразу, иначе — воркером Celery."""
    to = [email for email in recipients if email]
    if not to:
        return 0
    return send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=to,
        fail_silently=False,
    )


@shared_task
def do_import(user_id: int, url: str | None = None, path: str | None = None) -> dict:
    """Импорт YAML-прайса по URL или пути к файлу."""
    from backend.models import User

    user = User.objects.get(pk=user_id)
    if url:
        return import_price_list_from_url(user=user, url=url)
    if path:
        return import_price_list_from_path(user=user, path=path)
    raise PriceListError('Укажите url или path для импорта.')
