from django.conf import settings
from django.contrib.admin.sites import AdminSite
from django.contrib.auth.models import Permission
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, TestCase
from django.urls import reverse

from backend.admin import OrderAdmin
from backend.models import (
    Category,
    Contact,
    Order,
    OrderItem,
    OrderStatus,
    Product,
    ProductInfo,
    Shop,
    User,
    UserType,
)


class WarehouseAdminTests(TestCase):
    password = 'Str0ng-Passw0rd!'

    def setUp(self):
        self.factory = RequestFactory()
        self.superuser = User.objects.create_superuser(
            email='admin-warehouse@test.local',
            password=self.password,
        )
        self.shop_user = User.objects.create_user(
            email='shop-admin@test.local',
            password=self.password,
            type=UserType.SHOP,
            is_active=True,
            is_staff=True,
        )
        self.other_shop_user = User.objects.create_user(
            email='other-shop-admin@test.local',
            password=self.password,
            type=UserType.SHOP,
            is_active=True,
            is_staff=True,
        )
        self.buyer = User.objects.create_user(
            email='buyer-admin@test.local',
            password=self.password,
            type=UserType.BUYER,
            is_active=True,
        )
        self.shop = Shop.objects.create(name='Склад-1', user=self.shop_user, state=True)
        self.other_shop = Shop.objects.create(name='Склад-2', user=self.other_shop_user, state=True)
        category = Category.objects.create(name='Тест')
        product = Product.objects.create(name='Товар', category=category)
        self.offer = ProductInfo.objects.create(
            product=product,
            shop=self.shop,
            external_id=1,
            quantity=10,
            price=100,
            price_rrc=120,
        )
        other_offer = ProductInfo.objects.create(
            product=product,
            shop=self.other_shop,
            external_id=2,
            quantity=10,
            price=200,
            price_rrc=220,
        )
        contact = Contact.objects.create(
            user=self.buyer,
            city='Москва',
            street='Тверская',
            phone='+79000000000',
        )
        self.order = Order.objects.create(
            user=self.buyer,
            state=OrderStatus.NEW,
            contact=contact,
        )
        OrderItem.objects.create(
            order=self.order,
            product_info=self.offer,
            quantity=1,
            price=100,
        )
        self.other_order = Order.objects.create(
            user=self.buyer,
            state=OrderStatus.NEW,
            contact=contact,
        )
        OrderItem.objects.create(
            order=self.other_order,
            product_info=other_offer,
            quantity=1,
            price=200,
        )
        for user in (self.shop_user, self.other_shop_user):
            user.user_permissions.add(*Permission.objects.filter(content_type__app_label='backend'))

    def test_admin_status_change_sends_same_email_as_api(self):
        request = self.factory.post('/admin/')
        request.user = self.superuser
        model_admin = OrderAdmin(Order, AdminSite())
        form_class = model_admin.get_form(request, obj=self.order)
        form = form_class(
            data={
                'user': self.buyer.pk,
                'state': OrderStatus.CONFIRMED,
                'contact': self.order.contact_id,
            },
            instance=self.order,
        )
        self.assertTrue(form.is_valid(), form.errors)
        obj = form.save(commit=False)
        mail.outbox.clear()
        model_admin.save_model(request, obj, form, change=True)

        self.order.refresh_from_db()
        self.assertEqual(self.order.state, OrderStatus.CONFIRMED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('изменён', mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, [self.buyer.email])

    def test_shop_staff_sees_only_own_orders(self):
        self.client.login(email=self.shop_user.email, password=self.password)
        response = self.client.get(reverse('admin:backend_order_changelist'))
        self.assertEqual(response.status_code, 200)
        queryset = response.context['cl'].queryset
        self.assertIn(self.order, queryset)
        self.assertNotIn(self.other_order, queryset)

    def test_shop_import_price_from_admin(self):
        yaml_content = (settings.BASE_DIR / 'data' / 'shop2.yaml').read_bytes()
        self.client.login(email=self.superuser.email, password=self.password)
        url = reverse('admin:backend_shop_import_price', args=[self.shop.pk])
        get_page = self.client.get(url)
        self.assertEqual(get_page.status_code, 200)
        self.assertContains(get_page, 'Запустить импорт')

        response = self.client.post(url, {
            'yaml_file': SimpleUploadedFile('shop2.yaml', yaml_content, content_type='text/yaml'),
        }, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Импорт')
        self.shop.refresh_from_db()
        self.assertEqual(self.shop.name, 'М.Видео')
        self.assertGreaterEqual(ProductInfo.objects.filter(shop=self.shop).count(), 3)

    def test_admin_add_order_fills_item_price_from_offer(self):
        self.client.login(email=self.superuser.email, password=self.password)
        response = self.client.post(reverse('admin:backend_order_add'), {
            'user': self.buyer.pk,
            'state': OrderStatus.NEW,
            'contact': Contact.objects.get(user=self.buyer).pk,
            'ordered_items-TOTAL_FORMS': 1,
            'ordered_items-INITIAL_FORMS': 0,
            'ordered_items-MIN_NUM_FORMS': 0,
            'ordered_items-MAX_NUM_FORMS': 1000,
            'ordered_items-0-product_info': self.offer.pk,
            'ordered_items-0-quantity': 2,
            'ordered_items-0-id': '',
            '_save': 'Save',
        })
        self.assertEqual(response.status_code, 302, response.content.decode()[:1000])
        item = OrderItem.objects.get(order__user=self.buyer, quantity=2, product_info=self.offer)
        self.assertEqual(item.price, self.offer.price)
