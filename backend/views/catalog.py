from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from backend.models import Category, ProductInfo, Shop
from backend.serializers import CategorySerializer, ProductInfoSerializer, ShopSerializer


class CategoryView(ListAPIView):
    permission_classes = (AllowAny,)
    pagination_class = None
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ShopView(ListAPIView):
    permission_classes = (AllowAny,)
    pagination_class = None
    queryset = Shop.objects.filter(state=True)
    serializer_class = ShopSerializer


def _product_queryset():
    return (
        ProductInfo.objects.filter(shop__state=True)
        .select_related('shop', 'product__category')
        .prefetch_related('product_parameters__parameter')
    )


class ProductInfoView(ListAPIView):
    permission_classes = (AllowAny,)
    pagination_class = None
    serializer_class = ProductInfoSerializer

    def get_queryset(self):
        queryset = _product_queryset()
        shop_id = self.request.query_params.get('shop_id')
        category_id = self.request.query_params.get('category_id')
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        if category_id:
            queryset = queryset.filter(product__category_id=category_id)
        return queryset.distinct()


class ProductInfoDetailView(RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ProductInfoSerializer
    queryset = _product_queryset()
