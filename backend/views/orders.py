from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.permissions import IsBuyer, IsShopOrStaff
from backend.serializers import OrderSerializer, OrderStatusUpdateSerializer
from backend.services import orders
from backend.services.errors import ServiceError
from backend.views.common import handle_service_error, ok


class OrderView(APIView):
    permission_classes = (IsAuthenticated, IsBuyer)
    serializer_class = OrderSerializer

    def get(self, request, *args, **kwargs):
        queryset = orders.list_user_orders(request.user)
        return Response(OrderSerializer(queryset, many=True).data)

    def post(self, request, *args, **kwargs):
        try:
            order = orders.confirm_order(
                request.user,
                order_id=request.data.get('id'),
                contact_id=request.data.get('contact'),
            )
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(id=order.id, state=order.state, total_sum=order.total_sum)


class OrderDetailView(APIView):
    permission_classes = (IsAuthenticated, IsBuyer)
    serializer_class = OrderSerializer

    def get(self, request, pk, *args, **kwargs):
        try:
            order = orders.get_user_order(request.user, pk)
        except ServiceError as exc:
            return handle_service_error(exc)
        return Response(OrderSerializer(order).data)


class OrderStatusView(APIView):
    permission_classes = (IsAuthenticated, IsShopOrStaff)
    serializer_class = OrderStatusUpdateSerializer

    def patch(self, request, pk, *args, **kwargs):
        try:
            order = orders.update_order_status(
                request.user,
                pk,
                request.data.get('state'),
            )
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(id=order.id, state=order.state)
