import yaml
from django.conf import settings
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from backend.models import User, UserType
from backend.services import import_price_list, import_price_list_from_path
from backend.services.partners import export_price_list


class PartnerExportTests(APITestCase):
    password = 'Str0ng-Passw0rd!'

    def setUp(self):
        self.shop_user = User.objects.create_user(
            email='export-shop@test.local',
            password=self.password,
            type=UserType.SHOP,
            is_active=True,
        )
        import_price_list_from_path(
            user=self.shop_user,
            path=settings.BASE_DIR / 'data' / 'shop1.yaml',
        )
        token, _ = Token.objects.get_or_create(user=self.shop_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_export_yaml_roundtrip_matches_import_format(self):
        response = self.client.get('/api/v1/partner/export')
        self.assertEqual(response.status_code, 200)
        self.assertIn('yaml', response['Content-Type'])

        payload = yaml.safe_load(response.content)
        self.assertEqual(payload['shop'], 'Связной')
        self.assertGreaterEqual(len(payload['categories']), 4)
        self.assertEqual(len(payload['goods']), 14)
        self.assertTrue({'id', 'name'} <= payload['categories'][0].keys())
        self.assertTrue(
            {'id', 'category', 'name', 'price', 'price_rrc', 'quantity'}
            <= payload['goods'][0].keys()
        )

        stats = import_price_list(user=self.shop_user, data=payload)
        self.assertEqual(stats['created'], 0)
        self.assertEqual(stats['updated'], 14)

    def test_export_service_keeps_shop_name(self):
        payload = export_price_list(self.shop_user)
        self.assertEqual(payload['shop'], 'Связной')
        self.assertEqual(payload['goods'][0]['id'], 1234567)

    def test_buyer_cannot_export(self):
        buyer = User.objects.create_user(
            email='export-buyer@test.local',
            password=self.password,
            type=UserType.BUYER,
            is_active=True,
        )
        token, _ = Token.objects.get_or_create(user=buyer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get('/api/v1/partner/export')
        self.assertEqual(response.status_code, 403)
