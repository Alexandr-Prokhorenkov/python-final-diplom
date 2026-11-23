from django.core.management.base import BaseCommand, CommandError

from backend.models import User, UserType
from backend.services import PriceListError, import_price_list_from_path


class Command(BaseCommand):
    help = 'Импортировать YAML-прайс магазина из файла (data/shop1.yaml).'

    def add_arguments(self, parser):
        parser.add_argument('yaml_path', help='Путь к YAML-файлу прайса')
        parser.add_argument(
            '--email',
            required=True,
            help='Email пользователя-магазина (type=shop)',
        )

    def handle(self, *args, **options):
        email = options['email']
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'type': UserType.SHOP,
                'is_active': True,
            },
        )
        if created:
            user.set_unusable_password()
            user.save(update_fields=['password'])
            self.stdout.write(
                f'Создан пользователь магазина {email} без пароля. '
                f'Задайте пароль: python manage.py changepassword {email}'
            )
        elif user.type != UserType.SHOP:
            raise CommandError(f'Пользователь {email} не является магазином (type={user.type}).')

        try:
            stats = import_price_list_from_path(user=user, path=options['yaml_path'])
        except PriceListError as exc:
            raise CommandError(str(exc)) from exc

        self.stdout.write(self.style.SUCCESS(
            'Импорт завершён: магазин {shop}, создано {created}, '
            'обновлено {updated}, удалено {deleted}, обнулено {deactivated}.'.format(**stats)
        ))
