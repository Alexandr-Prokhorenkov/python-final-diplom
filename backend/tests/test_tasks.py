from django.conf import settings
from django.core import mail
from rest_framework.test import APITestCase

from backend.models import ProductInfo, User, UserType
from backend.tasks import do_import, send_email


class CeleryTasksTests(APITestCase):
    def test_send_email_task_puts_message_in_outbox(self):
        mail.outbox.clear()
        send_email.delay(
            'Тема Celery',
            'Текст письма',
            ['celery-user@test.local'],
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Тема Celery')
        self.assertEqual(mail.outbox[0].to, ['celery-user@test.local'])

    def test_do_import_task_loads_yaml_from_path(self):
        user = User.objects.create_user(
            email='celery-shop@test.local',
            password='Str0ng-Passw0rd!',
            type=UserType.SHOP,
            is_active=True,
        )
        stats = do_import.delay(
            user.pk,
            path=str(settings.BASE_DIR / 'data' / 'shop2.yaml'),
        ).get()
        self.assertEqual(stats['shop'], 'М.Видео')
        self.assertEqual(stats['created'], 3)
        self.assertEqual(ProductInfo.objects.filter(shop__user=user).count(), 3)
