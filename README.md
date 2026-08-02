# React Freight Auctions

SPA для работы с грузовыми аукционами (тестовое задание Frontend Developer).

## Стек

- React + TypeScript + Vite
- TanStack Router / Query
- Zustand (UI-state)
- React Hook Form + Zod
- Ant Design
- MSW
- Feature-Sliced Design
- ESLint + Prettier, Vitest

## Запуск

```bash
yarn
yarn dev
```

Проверки:

```bash
yarn lint
yarn test
yarn build
```

## Структура

```
src/
  app/        # провайдеры, роутер, layout
  pages/      # страницы маршрутов
  widgets/    # составные блоки UI
  features/   # пользовательские сценарии
  entities/   # доменные сущности
  shared/     # api, ui, lib, config, MSW
```

Компоненты именуются с суффиксом `*.component.tsx`.

## OpenAPI

В корне лежит **`openapi.auctions.v0.json`** — это **DRAFT** по PDF тестового задания
(`info.version: 0.0.0-draft`, допущения в `x-draft-assumptions`).

Когда придёт официальная схема от заказчика — заменить файл целиком и сверить
типы / MSW / Zod. До замены не считать контракт финальным.
