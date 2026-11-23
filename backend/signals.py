from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created

from backend.services.email import send_notification


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, **kwargs):
    """Письмо с токеном сброса пароля (django-rest-passwordreset)."""
    send_notification(
        subject=f'Сброс пароля для {reset_password_token.user.email}',
        message=f'Токен для сброса пароля: {reset_password_token.key}',
        recipients=[reset_password_token.user.email],
    )
