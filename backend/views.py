from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.permissions import IsShopUser
from backend.services import PriceListError, import_price_list_from_url


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
