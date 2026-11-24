import yaml
from django.http import HttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.permissions import IsShopUser
from backend.serializers import OrderSerializer, ShopSerializer
from backend.services import PriceListError, import_price_list_from_url, orders, partners
from backend.services.errors import ServiceError
from backend.views.common import handle_service_error, ok


class PartnerUpdate(APIView):
    """Загрузка YAML-прайса поставщика по URL."""

    permission_classes = (IsAuthenticated, IsShopUser)

    def post(self, request, *args, **kwargs):
        url = request.data.get('url')
        if not url:
            return Response(
                {'Status': False, 'Errors': 'Не указан url'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            stats = import_price_list_from_url(user=request.user, url=url)
        except PriceListError as exc:
            return Response(
                {'Status': False, 'Errors': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'Status': True, **stats})


class PartnerState(APIView):
    permission_classes = (IsAuthenticated, IsShopUser)
    serializer_class = ShopSerializer

    def get(self, request, *args, **kwargs):
        try:
            shop = partners.get_shop(request.user)
        except ServiceError as exc:
            return handle_service_error(exc)
        return Response(ShopSerializer(shop).data)

    def post(self, request, *args, **kwargs):
        try:
            shop = partners.set_shop_state(request.user, request.data.get('state'))
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(state=shop.state)


class PartnerOrders(APIView):
    permission_classes = (IsAuthenticated, IsShopUser)
    serializer_class = OrderSerializer

    def get(self, request, *args, **kwargs):
        queryset = orders.list_partner_orders(request.user)
        return Response(OrderSerializer(queryset, many=True).data)


class PartnerExport(APIView):
    """Выгрузка каталога магазина в YAML того же формата, что импорт."""

    permission_classes = (IsAuthenticated, IsShopUser)

    def get(self, request, *args, **kwargs):
        try:
            payload = partners.export_price_list(request.user)
        except ServiceError as exc:
            return handle_service_error(exc)
        body = yaml.safe_dump(
            payload,
            allow_unicode=True,
            sort_keys=False,
            default_flow_style=False,
        )
        response = HttpResponse(body, content_type='application/x-yaml; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="price.yaml"'
        return response
