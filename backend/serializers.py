from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from backend.models import (
    Category,
    Contact,
    Order,
    OrderItem,
    OrderStatus,
    Product,
    ProductInfo,
    ProductParameter,
    Shop,
    User,
)


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = (
            'id', 'city', 'street', 'house', 'structure',
            'building', 'apartment', 'phone',
        )
        read_only_fields = ('id',)


class UserSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(read_only=True, many=True)

    class Meta:
        model = User
        fields = (
            'id', 'first_name', 'last_name', 'email',
            'company', 'position', 'type', 'contacts',
        )
        read_only_fields = ('id', 'email', 'type', 'contacts')


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ConfirmEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()


class OrderStatusUpdateSerializer(serializers.Serializer):
    state = serializers.ChoiceField(
        choices=[choice for choice in OrderStatus.choices if choice[0] != OrderStatus.BASKET],
    )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'email', 'password',
            'company', 'position',
        )
        extra_kwargs = {
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
            'company': {'required': False},
            'position': {'required': False},
        }

    def validate_password(self, value):
        validate_password(value)
        return value


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')
        read_only_fields = ('id',)


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ('id', 'name', 'state')
        read_only_fields = ('id',)


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'category')


class ProductParameterSerializer(serializers.ModelSerializer):
    parameter = serializers.StringRelatedField()

    class Meta:
        model = ProductParameter
        fields = ('parameter', 'value')


class ProductInfoSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    product_parameters = ProductParameterSerializer(read_only=True, many=True)

    class Meta:
        model = ProductInfo
        fields = (
            'id', 'model', 'product', 'shop', 'quantity',
            'price', 'price_rrc', 'product_parameters',
        )
        read_only_fields = ('id',)


class OrderItemSerializer(serializers.ModelSerializer):
    product_info = ProductInfoSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product_info', 'quantity', 'price')
        read_only_fields = ('id', 'price')


class OrderSerializer(serializers.ModelSerializer):
    ordered_items = OrderItemSerializer(read_only=True, many=True)
    contact = ContactSerializer(read_only=True)
    total_sum = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('id', 'ordered_items', 'state', 'dt', 'total_sum', 'contact')
        read_only_fields = ('id', 'state', 'dt')

    def get_total_sum(self, obj):
        return obj.total_sum or 0
