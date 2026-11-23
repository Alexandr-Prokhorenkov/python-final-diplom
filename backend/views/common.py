from rest_framework import status
from rest_framework.response import Response

from backend.services.errors import ServiceError


def ok(**payload):
    return Response({'Status': True, **payload})


def fail(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({'Status': False, 'Errors': message}, status=status_code)


def handle_service_error(exc: ServiceError):
    return fail(exc.message, status_code=exc.status_code)
