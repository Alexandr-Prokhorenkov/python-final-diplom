from django.conf import settings
from django.core import mail
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from backend.models import (
    ConfirmEmailToken,
    Contact,
    OrderStatus,
    ProductInfo,
    Shop,
    User,
    UserType,
)
from backend.services import import_price_list_from_path


class Stage5ScenarioTests(APITestCase):
    """Сквозной сценарий зачёта: два магазина, заказ, письма, витрина."""

    password = 'Str0ng-Passw0rd!'

    def setUp(self):
        self.svyaznoy_user = User.objects.create_user(
            email='svyaznoy@test.local',
            password=self.password,
            type=UserType.SHOP,
            is_active=True,
        )
        self.mvideo_user = User.objects.create_user(
            email='mvideo@test.local',
            password=self.password,
            type=UserType.SHOP,
            is_active=True,
        )
        import_price_list_from_path(
            user=self.svyaznoy_user,
            path=settings.BASE_DIR / 'data' / 'shop1.yaml',
        )
        import_price_list_from_path(
            user=self.mvideo_user,
            path=settings.BASE_DIR / 'data' / 'shop2.yaml',
        )
        self.svyaznoy = Shop.objects.get(user=self.svyaznoy_user)
        self.mvideo = Shop.objects.get(user=self.mvideo_user)

    def _register_buyer(self, email='buyer-e2e@test.local'):
        register = self.client.post('/api/v1/user/register', {
            'first_name': 'Пётр',
            'last_name': 'Петров',
            'email': email,
            'password': self.password,
        }, format='json')
        self.assertTrue(register.data['Status'], register.data)
        user = User.objects.get(email=email)
        token = ConfirmEmailToken.objects.get(user=user)
        self.client.post('/api/v1/user/register/confirm', {
            'email': email,
            'token': token.key,
        }, format='json')
        login = self.client.post('/api/v1/user/login', {
            'email': email,
            'password': self.password,
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {login.data['Token']}")
        return user

    def test_products_filters_by_shop_and_category(self):
        all_products = self.client.get('/api/v1/products')
        self.assertEqual(len(all_products.data), 17)

        by_shop = self.client.get('/api/v1/products', {'shop_id': self.svyaznoy.id})
        self.assertEqual(len(by_shop.data), 14)
        self.assertTrue(all(item['shop']['id'] == self.svyaznoy.id for item in by_shop.data))

        by_category = self.client.get('/api/v1/products', {'category_id': 224})
        self.assertGreaterEqual(len(by_category.data), 2)
        self.assertTrue(all(item['product']['category'] == 'Смартфоны' for item in by_category.data))

        both = self.client.get('/api/v1/products', {
            'shop_id': self.mvideo.id,
            'category_id': 5,
        })
        self.assertEqual(len(both.data), 1)
        self.assertEqual(both.data[0]['shop']['id'], self.mvideo.id)

        detail = self.client.get(f'/api/v1/products/{both.data[0]["id"]}/')
        self.assertEqual(detail.status_code, 200)
        self.assertTrue(detail.data['product_parameters'])

    def test_order_from_two_shops_emails_partner_and_showcase(self):
        mail.outbox.clear()
        buyer = self._register_buyer()
        self.assertEqual(len(mail.outbox), 1)

        contact = self.client.post('/api/v1/user/contact', {
            'city': 'Москва',
            'street': 'Арбат',
            'house': '10',
            'phone': '+79001112233',
        }, format='json')
        self.assertTrue(contact.data['Status'], contact.data)
        contact_id = Contact.objects.get(user=buyer).id

        offer_a = ProductInfo.objects.get(shop=self.svyaznoy, external_id=4216292)
        offer_b = ProductInfo.objects.get(shop=self.mvideo, external_id=9000001)
        stock_a, stock_b = offer_a.quantity, offer_b.quantity

        add_a = self.client.post('/api/v1/basket', {
            'product_info': offer_a.id,
            'quantity': 1,
        }, format='json')
        add_b = self.client.post('/api/v1/basket', {
            'product_info': offer_b.id,
            'quantity': 2,
        }, format='json')
        self.assertTrue(add_a.data['Status'], add_a.data)
        self.assertTrue(add_b.data['Status'], add_b.data)

        basket = self.client.get('/api/v1/basket')
        shop_ids = {item['product_info']['shop']['id'] for item in basket.data['ordered_items']}
        self.assertEqual(shop_ids, {self.svyaznoy.id, self.mvideo.id})
        expected_sum = offer_a.price * 1 + offer_b.price * 2
        self.assertEqual(basket.data['total_sum'], expected_sum)
        order_id = basket.data['id']

        confirm = self.client.post('/api/v1/order', {
            'id': order_id,
            'contact': contact_id,
        }, format='json')
        self.assertTrue(confirm.data['Status'], confirm.data)
        self.assertEqual(confirm.data['state'], OrderStatus.NEW)

        offer_a.refresh_from_db()
        offer_b.refresh_from_db()
        self.assertEqual(offer_a.quantity, stock_a - 1)
        self.assertEqual(offer_b.quantity, stock_b - 2)

        subjects = [message.subject for message in mail.outbox]
        self.assertTrue(any(f'Заказ №{order_id} принят' in subject for subject in subjects))
        self.assertTrue(any(f'Накладная заказа №{order_id}' in subject for subject in subjects))
        admin_mail = next(m for m in mail.outbox if 'Накладная' in m.subject)
        self.assertEqual(admin_mail.to, [settings.ADMIN_EMAIL])
        buyer_mail = next(m for m in mail.outbox if f'Заказ №{order_id} принят' == m.subject)
        self.assertEqual(buyer_mail.to, [buyer.email])

        orders = self.client.get('/api/v1/order')
        self.assertEqual(len(orders.data), 1)
        self.assertEqual(orders.data[0]['state'], OrderStatus.NEW)
        self.assertEqual(orders.data[0]['total_sum'], expected_sum)
        self.assertEqual(len(orders.data[0]['ordered_items']), 2)

        detail = self.client.get(f'/api/v1/order/{order_id}/')
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['contact']['city'], 'Москва')

        shop_token, _ = Token.objects.get_or_create(user=self.svyaznoy_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {shop_token.key}')
        partner_orders = self.client.get('/api/v1/partner/orders')
        self.assertEqual(len(partner_orders.data), 1)
        self.assertEqual(partner_orders.data[0]['id'], order_id)

        status_resp = self.client.patch(
            f'/api/v1/order/{order_id}/status',
            {'state': OrderStatus.CONFIRMED},
            format='json',
        )
        self.assertTrue(status_resp.data['Status'], status_resp.data)
        self.assertTrue(any('изменён' in message.subject for message in mail.outbox))
        status_mail = next(m for m in mail.outbox if 'изменён' in m.subject)
        self.assertEqual(status_mail.to, [buyer.email])

        hide = self.client.post('/api/v1/partner/state', {'state': False}, format='json')
        self.assertTrue(hide.data['Status'], hide.data)

        self.client.credentials()
        shops = self.client.get('/api/v1/shops')
        shop_ids = {item['id'] for item in shops.data}
        self.assertNotIn(self.svyaznoy.id, shop_ids)
        self.assertIn(self.mvideo.id, shop_ids)

        products = self.client.get('/api/v1/products')
        remaining_shops = {item['shop']['id'] for item in products.data}
        self.assertNotIn(self.svyaznoy.id, remaining_shops)
        self.assertIn(self.mvideo.id, remaining_shops)
        self.assertEqual(len(products.data), 3)
