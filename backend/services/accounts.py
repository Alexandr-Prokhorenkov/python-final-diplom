from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.authtoken.models import Token

from backend.models import ConfirmEmailToken, Contact, User, UserType
from backend.serializers import ContactSerializer, RegisterSerializer, UserSerializer
from backend.services.email import send_notification
from backend.services.errors import ServiceError

MAX_CONTACTS = 5


def register_user(data) -> User:
    serializer = RegisterSerializer(data=data)
    if not serializer.is_valid():
        raise ServiceError(serializer.errors)
    user = User(
        first_name=serializer.validated_data['first_name'],
        last_name=serializer.validated_data['last_name'],
        email=serializer.validated_data['email'],
        company=serializer.validated_data.get('company', ''),
        position=serializer.validated_data.get('position', ''),
        type=UserType.BUYER,
        is_active=False,
    )
    user.set_password(serializer.validated_data['password'])
    user.save()
    token = ConfirmEmailToken.objects.create(user=user)
    send_notification(
        subject='Подтверждение регистрации',
        message=f'Токен подтверждения email: {token.key}',
        recipients=[user.email],
    )
    return user


def confirm_email(email: str, token_key: str) -> None:
    if not email or not token_key:
        raise ServiceError('Укажите email и token')
    token = ConfirmEmailToken.objects.filter(user__email=email, key=token_key).first()
    if not token:
        raise ServiceError('Неправильно указан токен или email')
    token.user.is_active = True
    token.user.save(update_fields=['is_active'])
    token.delete()


def login_user(*, request, email: str, password: str) -> str:
    if not email or not password:
        raise ServiceError('Укажите email и password')
    user = authenticate(request, username=email, password=password)
    if user is None:
        raise ServiceError('Не удалось авторизовать')
    if not user.is_active:
        raise ServiceError('Пользователь не активен. Подтвердите email.')
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def update_profile(user: User, data) -> User:
    if 'password' in data and data.get('password'):
        try:
            validate_password(data['password'], user=user)
        except ValidationError as exc:
            raise ServiceError({'password': list(exc.messages)})
        user.set_password(data['password'])
        user.save(update_fields=['password'])
        Token.objects.filter(user=user).delete()

    serializer = UserSerializer(user, data=data, partial=True)
    if not serializer.is_valid():
        raise ServiceError(serializer.errors)
    return serializer.save()


def list_contacts(user: User):
    return Contact.objects.filter(user=user)


def create_contact(user: User, data) -> Contact:
    if user.contacts.count() >= MAX_CONTACTS:
        raise ServiceError(f'Можно сохранить не больше {MAX_CONTACTS} адресов.')
    serializer = ContactSerializer(data=data)
    if not serializer.is_valid():
        raise ServiceError(serializer.errors)
    return serializer.save(user=user)


def update_contact(user: User, contact_id, data) -> Contact:
    contact = Contact.objects.filter(id=_as_int(contact_id, 'id'), user=user).first()
    if not contact:
        raise ServiceError('Контакт не найден', status_code=404)
    serializer = ContactSerializer(contact, data=data, partial=True)
    if not serializer.is_valid():
        raise ServiceError(serializer.errors)
    return serializer.save()


def delete_contacts(user: User, items) -> int:
    ids = _as_id_list(items)
    if not ids:
        raise ServiceError('Укажите id контактов для удаления')
    deleted, _ = Contact.objects.filter(user=user, id__in=ids).delete()
    return deleted


def _as_int(value, field='id') -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ServiceError(f'Некорректное значение {field}') from None


def _as_id_list(items) -> list[int]:
    if items is None:
        return []
    if isinstance(items, list):
        raw = items
    else:
        raw = str(items).split(',')
    ids = []
    for item in raw:
        item = str(item).strip()
        if item:
            ids.append(_as_int(item))
    return ids
