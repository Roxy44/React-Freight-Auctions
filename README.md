# React Freight Auctions

SPA для перевозчика-участника грузовых аукционов (тестовое задание Frontend Developer).

Список лотов → деталка → история ставок → установка/изменение ставки. Backend нет: API мокается через MSW с мутабельным in-memory store.

## Стек

- React 19 + TypeScript + Vite
- TanStack Router (code-based) + TanStack Query
- Zustand — только точечный UI-state (drawer фильтров)
- React Hook Form + Zod
- Ant Design (`ru_RU`)
- MSW
- Feature-Sliced Design
- ESLint + Prettier, Vitest

Package manager: **yarn**.

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

Открой http://localhost:5173 (порт Vite по умолчанию).

## Demo (GitHub Pages)

После пуша в `main` workflow `Deploy GitHub Pages` собирает статику с `base=/React-Freight-Auctions/` и публикует сайт:

https://roxy44.github.io/React-Freight-Auctions/

В Settings → Pages источник должен быть **GitHub Actions** (первый успешный run обычно поднимает environment сам).

## Маршруты

| Путь | Назначение |
| --- | --- |
| `/` | Список аукционов (фильтры в URL search params) |
| `/auctions/$auctionUuid` | Детальная карточка |
| `/auctions/$auctionUuid/bets` | История ставок |
| `/auctions/$auctionUuid/bet` | Форма ставки (отдельная ссылка) |

## Структура

```
src/
  app/        # провайдеры, роутер, layout, стили
  pages/      # экраны маршрутов
  widgets/    # карточка лота, фильтры
  entities/   # auction: api, schemas, query keys, mappers, search params
  shared/     # http, errors, MSW store/fixtures, UI-kit helpers, cities
```

React-компоненты именуются с суффиксом `*.component.tsx`.

## OpenAPI

В корне: `openapi.auctions.v0.json` — **DRAFT** (`0.0.0-draft`), собран по PDF задания.
Официальный файл от заказчика не был приложен. Допущения — в `x-draft-assumptions`.
После получения оригинала: заменить файл и сверить типы / MSW / Zod.

## Поведение фильтров (важно)

- Фильтры живут в **URL** и входят в `queryKey` list (после reload сохраняются).
- Булевы `is_available` / `is_bidder`: Select «Не важно / Да / Нет» (не Switch).
- Статус: один multi-select → в API и URL: **1 значение = `status`**, **2+ = `statuses`**.
- Диапазон цены смотрит **видимую** цену карточки: скрытая (`no_view_cargo_price`) или пустая цена не проходит фильтр (иначе можно угадать скрытую сумму).

## Данные MSW

~16 лотов в `src/shared/api/msw/fixtures.ts` (удобно проверять пагинацию при `page_size` 5/10).

Полезные кейсы:

- `CRG-10021` — есть моя ставка, статус Losing
- `CRG-10045` — можно поставить ставку (Up)
- `CRG-10077` — `hide_bets_history`
- `CRG-10102` — без цены, `can_set_bet: false`
- `CRG-10155` — цена/контакты скрыты, Winner

## Что проверялось вручную

- Список: skeleton → данные; empty при жёстком фильтре; пагинация и смена `page_size`
- Фильтры в URL после Apply / Reload; сброс
- Prefetch деталки по hover на карточке
- Деталка: флаги ограничений, контакты/адреса/цена
- Ставки: список, empty, скрытая история
- Ставка: успех + toast + обновление list/detail/bets; ошибка min/max/step (422)
- Адаптив: фильтры desktop (2 группы) / mobile (drawer, группы стол)

## Тесты

Чистая логика (Vitest):

- search params parsing + request builder (`status` / `statuses`)
- ViewModel-мапперы списка
- validation schema ставки
- MSW store: фильтры, ставка, пагинация, hide bets

```bash
yarn test
```

## Ограничения

- Контракт API — draft, может разойтись с официальной схемой.
- Нет auth / ролей грузовладельца (по ТЗ — сценарий участника торгов).
- Бандл Ant Design крупный; code-splitting страниц — возможное улучшение.
- Работа с AI: см. `AI_USAGE.md`.
