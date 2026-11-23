from django.core import mail
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from backend.models import (
    Category,
    ConfirmEmailToken,
    Contact,
    OrderStatus,
    Product,
    ProductInfo,
    Shop,
    User,
    UserType,
)


class ApiFlowTests(APITestCase):
    def setUp(self):
        self.password = 'Str0ng-Passw0rd!'
        self.shop_user = User.objects.create_user(
            email='shop-api@test.local',
            password=self.password,
            type=UserType.SHOP,
            is_active=True,
        )
        self.shop = Shop.objects.create(name='Тест-магазин', user=self.shop_user, state=True)
        self.category = Category.objects.create(name='Смартфоны')
        self.category.shops.add(self.shop)
        self.product = Product.objects.create(name='Тестовый телефон', category=self.category)
        self.offer = ProductInfo.objects.create(
            product=self.product,
            shop=self.shop,
            external_id=100,
            model='test/phone',
            quantity=5,
            price=1000,
            price_rrc=1200,
        )

    def test_register_confirm_login_and_order(self):
        register = self.client.post('/api/v1/user/register', {
            'first_name': 'Иван',
            'last_name': 'Иванов',
            'email': 'buyer-api@test.local',
            'password': self.password,
        }, format='json')
        self.assertEqual(register.status_code, 200, register.data)
        self.assertTrue(register.data['Status'])
        self.assertEqual(len(mail.outbox), 1)

        user = User.objects.get(email='buyer-api@test.local')
        self.assertFalse(user.is_active)
        token = ConfirmEmailToken.objects.get(user=user)

        inactive_login = self.client.post('/api/v1/user/login', {
            'email': 'buyer-api@test.local',
            'password': self.password,
        }, format='json')
        self.assertFalse(inactive_login.data['Status'])

        confirm = self.client.post('/api/v1/user/register/confirm', {
            'email': user.email,
            'token': token.key,
        }, format='json')
        self.assertTrue(confirm.data['Status'])

        login = self.client.post('/api/v1/user/login', {
            'email': user.email,
            'password': self.password,
        }, format='json')
        self.assertTrue(login.data['Status'])
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {login.data['Token']}")

        products = self.client.get('/api/v1/products')
        self.assertEqual(products.status_code, 200)
        self.assertEqual(len(products.data), 1)

        detail = self.client.get(f'/api/v1/products/{self.offer.id}/')
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['price'], 1000)

        contact = self.client.post('/api/v1/user/contact', {
            'city': 'Москва',
            'street': 'Тверская',
            'house': '1',
            'phone': '+79000000000',
        }, format='json')
        self.assertTrue(contact.data['Status'])
        contact_id = Contact.objects.get(user=user).id

        add = self.client.post('/api/v1/basket', {
            'product_info': self.offer.id,
            'quantity': 2,
        }, format='json')
        self.assertTrue(add.data['Status'], add.data)

        overstock = self.client.post('/api/v1/basket', {
            'product_info': self.offer.id,
            'quantity': 10,
        }, format='json')
        self.assertFalse(overstock.data['Status'])

        basket = self.client.get('/api/v1/basket')
        self.assertEqual(basket.data['total_sum'], 2000)
        order_id = basket.data['id']

        confirm_order = self.client.post('/api/v1/order', {
            'id': order_id,
            'contact': contact_id,
        }, format='json')
        self.assertTrue(confirm_order.data['Status'], confirm_order.data)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.quantity, 3)
        self.assertEqual(len(mail.outbox), 3)  # register + buyer + admin

        orders = self.client.get('/api/v1/order')
        self.assertEqual(len(orders.data), 1)
        self.assertEqual(orders.data[0]['state'], OrderStatus.NEW)

        shop_token, _ = Token.objects.get_or_create(user=self.shop_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {shop_token.key}')
        partner_orders = self.client.get('/api/v1/partner/orders')
        self.assertEqual(len(partner_orders.data), 1)

        status_resp = self.client.patch(
            f'/api/v1/order/{order_id}/status',
            {'state': OrderStatus.CONFIRMED},
            format='json',
        )
        self.assertTrue(status_resp.data['Status'], status_resp.data)
        self.assertEqual(len(mail.outbox), 4)

    def test_buyer_cannot_import_price(self):
        buyer = User.objects.create_user(
            email='only-buyer@test.local',
            password=self.password,
            type=UserType.BUYER,
            is_active=True,
        )
        token, _ = Token.objects.get_or_create(user=buyer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post('/api/v1/partner/update', {'url': 'https://example.com/a.yaml'})
        self.assertEqual(response.status_code, 403)

    def test_closed_shop_cannot_be_added_to_basket(self):
        buyer = User.objects.create_user(
            email='closed-shop-buyer@test.local',
            password=self.password,
            type=UserType.BUYER,
            is_active=True,
        )
        token, _ = Token.objects.get_or_create(user=buyer)
        self.shop.state = False
        self.shop.save(update_fields=['state'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post('/api/v1/basket', {
            'product_info': self.offer.id,
            'quantity': 1,
        }, format='json')
        self.assertFalse(response.data['Status'])
