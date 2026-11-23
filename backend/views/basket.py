from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.permissions import IsBuyer
from backend.serializers import OrderSerializer
from backend.services import basket
from backend.services.errors import ServiceError
from backend.views.common import handle_service_error, ok


class BasketView(APIView):
    permission_classes = (IsAuthenticated, IsBuyer)
    serializer_class = OrderSerializer

    def get(self, request, *args, **kwargs):
        current = basket.get_basket(request.user)
        return Response(OrderSerializer(current).data)

    def post(self, request, *args, **kwargs):
        try:
            created = basket.add_items(request.user, request.data)
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(**{'Создано объектов': created})

    def put(self, request, *args, **kwargs):
        try:
            updated = basket.update_items(request.user, request.data)
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(**{'Обновлено объектов': updated})

    def delete(self, request, *args, **kwargs):
        try:
            deleted = basket.delete_items(request.user, request.data)
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(**{'Удалено объектов': deleted})
