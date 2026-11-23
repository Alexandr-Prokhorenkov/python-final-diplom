from django.conf import settings
from django.core.mail import send_mail


def send_notification(subject: str, message: str, recipients: list[str]) -> None:
    """Синхронная отправка письма. На этапе 7 уйдёт в Celery."""
    to = [email for email in recipients if email]
    if not to:
        return
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=to,
        fail_silently=False,
    )
