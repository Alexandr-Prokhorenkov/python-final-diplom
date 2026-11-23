from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.permissions import IsBuyer
from backend.serializers import (
    ConfirmEmailSerializer,
    ContactSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
from backend.services import accounts
from backend.services.errors import ServiceError
from backend.views.common import handle_service_error, ok


class RegisterAccount(APIView):
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        try:
            accounts.register_user(request.data)
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok()


class ConfirmAccount(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ConfirmEmailSerializer

    def post(self, request, *args, **kwargs):
        try:
            accounts.confirm_email(request.data.get('email'), request.data.get('token'))
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok()


class LoginAccount(APIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        try:
            token = accounts.login_user(
                request=request,
                email=request.data.get('email'),
                password=request.data.get('password'),
            )
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(Token=token)


class AccountDetails(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data)

    def post(self, request, *args, **kwargs):
        try:
            accounts.update_profile(request.user, request.data)
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok()


class ContactView(APIView):
    permission_classes = (IsAuthenticated, IsBuyer)
    serializer_class = ContactSerializer

    def get(self, request, *args, **kwargs):
        contacts = accounts.list_contacts(request.user)
        return Response(ContactSerializer(contacts, many=True).data)

    def post(self, request, *args, **kwargs):
        try:
            contact = accounts.create_contact(request.user, request.data)
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(id=contact.id)

    def put(self, request, *args, **kwargs):
        try:
            accounts.update_contact(request.user, request.data.get('id'), request.data)
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok()

    def delete(self, request, *args, **kwargs):
        try:
            deleted = accounts.delete_contacts(
                request.user,
                request.data.get('items', request.data.get('id')),
            )
        except ServiceError as exc:
            return handle_service_error(exc)
        return ok(**{'Удалено объектов': deleted})
