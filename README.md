# Versta Delivery Orders

Учебное веб-приложение для приёмки заказов на доставку, выполненное по тестовому заданию Versta.

## Стек

- .NET 9 и ASP.NET Core Web API;
- Entity Framework Core и SQLite;
- React, TypeScript и Vite;
- xUnit.

## Требования

- .NET SDK 9;
- Node.js и npm.

## Структура

```text
VerstaDeliveryOrders/
├── src/
│   ├── VerstaDeliveryOrders.Api/
│   └── versta-delivery-orders-client/
├── tests/VerstaDeliveryOrders.Tests/
└── VerstaDeliveryOrders.sln
```

## Запуск backend

Из корня репозитория:

```bash
dotnet restore
dotnet run --project src/VerstaDeliveryOrders.Api
```

API будет доступен по адресу `http://localhost:5000`, Swagger — `http://localhost:5000/swagger`.

## Запуск frontend

В отдельном терминале:

```bash
cd src/versta-delivery-orders-client
npm install
npm run dev
```

Клиент будет доступен по адресу `http://localhost:5173`.

## Переменная окружения

Клиент использует адрес API из `VITE_API_URL`. Для локальной разработки значение уже указано в примере:

```text
VITE_API_URL=http://localhost:5000
```

При необходимости скопируйте `src/versta-delivery-orders-client/.env.example` в `.env`.

## Проверки

```bash
dotnet test VerstaDeliveryOrders.sln
```

Для клиента:

```bash
cd src/versta-delivery-orders-client
npm run lint
npm run build
```

## Основные возможности

Приложение позволяет:

1. Создавать заказ на доставку.
2. Просматривать список созданных заказов.
3. Открывать заказ в режиме чтения с автоматически сформированным номером.

SQLite-база создаётся автоматически, а миграции применяются при запуске API.
