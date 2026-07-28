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

API будет доступен по адресу `http://localhost:5000`.

## Запуск frontend

В отдельном терминале:

```bash
cd src/versta-delivery-orders-client
npm install
npm run dev
```

Клиент будет доступен по адресу `http://localhost:5173`.

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

После завершения разработки приложение позволит:

1. Создавать заказ на доставку.
2. Просматривать список созданных заказов.
3. Открывать заказ в режиме чтения с автоматически сформированным номером.

Миграции базы данных будут автоматически применяться при запуске API.
