from backend.tasks import send_email


def send_notification(subject: str, message: str, recipients: list[str]) -> None:
    """Ставит письмо в очередь Celery (или выполняет сразу при ALWAYS_EAGER)."""
    to = [email for email in recipients if email]
    if not to:
        return
    send_email.delay(subject, message, to)
