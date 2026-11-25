# Frontend (Angular 20)

SPA витрины и кабинетов к REST API `orders_service`. Архитектура — Feature-Sliced Design, UI — PrimeNG (Aura). Бриф: [`../frontend.md`](../frontend.md).

## Запуск

Нужен Node 20+. В этом репозитории: `nvm use 22`.

```bash
cd frontend
npm install
```

В другом терминале Django:

```bash
python manage.py runserver
```

Фронтенд:

```bash
npm start
```

Откройте http://127.0.0.1:4200/. Прокси `/api` и `/admin` идёт на `http://127.0.0.1:8000`.

## Слои

`src/app` → `src/pages` → `src/widgets` → `src/features` → `src/entities` → `src/shared`

Сборка: `npm run build`. Тесты: `npm test`.
