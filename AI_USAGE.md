# AI Usage

Документ по требованиям тестового задания. Обновлять по ходу работы.

## Какие части делались с AI

- Разбор PDF тестового задания и фиксация стека/требований.
- Онбординг и запись `project/stack.mdc`.
- Инициализация Vite + React + TypeScript (yarn), установка зависимостей стека.
- Базовый FSD-скелет: `app` / `pages` / `widgets` / `features` / `entities` / `shared`.
- Настройка ESLint + Prettier, Vitest, alias `@/`, MSW worker.
- Code-based роутинг TanStack Router (заглушки страниц списка, деталки, ставок, формы ставки).
- Провайдеры: TanStack Query, Ant Design (`ru_RU`), Zustand UI-store-заготовка.
- Draft `openapi.auctions.v0.json` по полям из PDF (официальной схемы не было).
- README с запуском и пометкой, что OpenAPI — draft.

## Какие решения принял кандидат сам

- Zustand вместо MobX.
- UI-kit: Ant Design (не shadcn/Mantine).
- Package manager: yarn.
- Фильтры синхронизировать через URL search params (не localStorage).
- UI-копирайт на русском.
- Code-based routes (без file-based TanStack Router plugin) — проще стыкуется с FSD.
- Пока нет официальной схемы — работать по draft OpenAPI и сверить потом с оригиналом.
- `jsdom@24` вместо latest (совместимость с Node 20).
- В `.yarnrc`: `ignore-engines true` из‑за engine-check у транзитивных пакетов.

## Какие AI-предложения были отклонены / скорректированы

- Нельзя считать swagger.io/specification или «пример OpenAPI для auctions» официальной схемой задания — это общий стандарт формата.
- Не подменять задание публичными API (apiauctions.io, ATI и т.п.) — контракты другие.
- Не выдавать draft-схему за источник правды: в README/`info` явно `0.0.0-draft` и `x-draft-assumptions`.
- Не ставить пакеты до явного выбора менеджера/UI/линтера (конституция W-6).

## Что проверял особенно внимательно

- Соответствие обязательного стека из PDF.
- Именование компонентов: `*.component.tsx`.
- Что `yarn build`, `yarn lint`, `yarn test` проходят после инициализации.
- Что публичного `openapi.auctions.v0.json` в сети нет; ответ «лежит на swagger» — ложный след.
- Допущения в draft (пагинация list, enum статусов, формат 422) вынесены явно, а не спрятаны в коде.

## Какие риски остались

- Draft OpenAPI может разойтись с официальной схемой: имена полей, enum, nullable, формат list/422, вложенность DTO.
- MSW пока заглушка list; мутабельный store и edge cases ещё не реализованы.
- Страницы — плейсхолдеры; бизнес-логика фильтров/ставки/prefetch отсутствует.
- Node 20 + `ignore-engines`: возможны сюрпризы на CI с другой версией Node.
- Ant Design увеличивает бандл (уже warning >500kb) — понадобится code-splitting страниц.

## Что улучшить при наличии ещё одного дня

- Подключить официальную схему и перегенерировать/сверить типы + MSW + Zod.
- Реализовать полный list с фильтрами в URL, skeleton/empty/error, prefetch.
- Detail / bets / place-bet end-to-end с инвалидацией query и toast/422.
- Минимальные unit-тесты: search params, request builder, mappers, bet schema.
- Дописать сценарии проверки в README и пройти их вручную.
