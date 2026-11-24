from django.conf import settings
from rest_framework.test import APITestCase

from backend.models import Category, ProductInfo, Shop, User, UserType
from backend.services import import_price_list_from_path


class YamlImportTests(APITestCase):
    def setUp(self):
        self.shop_user = User.objects.create_user(
            email='svyaznoy@test.local',
            password='Str0ng-Passw0rd!',
            type=UserType.SHOP,
            is_active=True,
        )

    def test_import_shop1_yaml_creates_catalog(self):
        stats = import_price_list_from_path(
            user=self.shop_user,
            path=settings.BASE_DIR / 'data' / 'shop1.yaml',
        )
        self.assertEqual(stats['shop'], 'Связной')
        self.assertEqual(stats['created'], 14)
        shop = Shop.objects.get(user=self.shop_user)
        self.assertEqual(shop.name, 'Связной')
        self.assertEqual(Category.objects.filter(shops=shop).count(), 4)
        self.assertEqual(ProductInfo.objects.filter(shop=shop).count(), 14)

        again = import_price_list_from_path(
            user=self.shop_user,
            path=settings.BASE_DIR / 'data' / 'shop1.yaml',
        )
        self.assertEqual(again['created'], 0)
        self.assertEqual(again['updated'], 14)
        self.assertEqual(ProductInfo.objects.filter(shop=shop).count(), 14)

    def test_import_shop2_yaml_second_supplier(self):
        second = User.objects.create_user(
            email='mvideo@test.local',
            password='Str0ng-Passw0rd!',
            type=UserType.SHOP,
            is_active=True,
        )
        import_price_list_from_path(
            user=self.shop_user,
            path=settings.BASE_DIR / 'data' / 'shop1.yaml',
        )
        stats = import_price_list_from_path(
            user=second,
            path=settings.BASE_DIR / 'data' / 'shop2.yaml',
        )
        self.assertEqual(stats['shop'], 'М.Видео')
        self.assertEqual(stats['created'], 3)
        self.assertEqual(Shop.objects.filter(state=True).count(), 2)
        self.assertEqual(ProductInfo.objects.count(), 17)
