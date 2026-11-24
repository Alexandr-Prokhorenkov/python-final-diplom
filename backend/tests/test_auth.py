from django.core import mail
from rest_framework.test import APITestCase

from backend.models import ConfirmEmailToken, User


class RegisterConfirmLoginTests(APITestCase):
    password = 'Str0ng-Passw0rd!'

    def test_register_sends_token_confirm_enables_login(self):
        response = self.client.post('/api/v1/user/register', {
            'first_name': 'Иван',
            'last_name': 'Иванов',
            'email': 'buyer@test.local',
            'password': self.password,
            'company': 'ООО Ромашка',
            'position': 'Менеджер',
        }, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(response.data['Status'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('подтвержден', mail.outbox[0].subject.lower())

        user = User.objects.get(email='buyer@test.local')
        self.assertFalse(user.is_active)
        token = ConfirmEmailToken.objects.get(user=user)
        self.assertIn(token.key, mail.outbox[0].body)

        inactive = self.client.post('/api/v1/user/login', {
            'email': user.email,
            'password': self.password,
        }, format='json')
        self.assertFalse(inactive.data['Status'])

        confirm = self.client.post('/api/v1/user/register/confirm', {
            'email': user.email,
            'token': token.key,
        }, format='json')
        self.assertTrue(confirm.data['Status'])
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertFalse(ConfirmEmailToken.objects.filter(user=user).exists())

        login = self.client.post('/api/v1/user/login', {
            'email': user.email,
            'password': self.password,
        }, format='json')
        self.assertTrue(login.data['Status'])
        self.assertIn('Token', login.data)
        self.assertTrue(login.data['Token'])
