from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from backend.models import User, UserType


class PermissionTests(APITestCase):
    password = 'Str0ng-Passw0rd!'

    def test_buyer_cannot_call_partner_update(self):
        buyer = User.objects.create_user(
            email='buyer-perm@test.local',
            password=self.password,
            type=UserType.BUYER,
            is_active=True,
        )
        token, _ = Token.objects.get_or_create(user=buyer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post(
            '/api/v1/partner/update',
            {'url': 'https://example.com/price.yaml'},
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_anonymous_cannot_open_basket(self):
        response = self.client.get('/api/v1/basket')
        self.assertEqual(response.status_code, 401)
