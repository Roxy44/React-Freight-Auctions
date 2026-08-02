# AI Usage

Документ по требованиям тестового задания.

## Какие части делались с AI

- Разбор PDF задания, фиксация стека, онбординг (`project/stack.mdc`).
- Инициализация Vite + React + TypeScript (yarn), установка зависимостей.
- FSD-скелет, ESLint + Prettier, Vitest, alias `@/`, MSW worker.
- Draft `openapi.auctions.v0.json` по полям из PDF (официальной схемы не было).
- MSW: fixtures, мутабельный store, handlers (list / detail / bets / place bet).
- Entities: Zod-схемы, API-клиент, query keys, search params, mappers, bet schema.
- Страницы списка / деталки / ставок / формы ставки; виджеты карточки и фильтров.
- Unit-тесты чистой логики; README и этот файл.

## Какие решения принял кандидат сам

- Zustand вместо MobX; Ant Design; yarn; UI на русском.
- Фильтры в URL search params (не localStorage); значения входят в TanStack Query `queryKey`.
- Code-based TanStack Router (без file-based plugin) — проще стыкуется с FSD.
- Draft OpenAPI как временный контракт до файла от заказчика.
- `jsdom@24` + `.yarnrc ignore-engines` (Node 20 vs engine-check у транзитивных пакетов).
- Булевы фильтры — Select «Не важно / Да / Нет», не Switch.
- Статус в UI — один multi-select; в API и URL: 1 → `status`, 2+ → `statuses`.
- Фильтр цены по **видимой** цене карточки (скрытая цена не участвует в диапазоне).
- Слой `features/` не раздували пустыми слайсами: форма ставки живёт на page + schema в entities.

## Какие AI-предложения были отклонены / скорректированы

- Не считать swagger.io/specification или «пример OpenAPI для auctions» схемой задания.
- Не подменять задание чужими публичными auction API.
- Не выдавать draft-схему за финальный источник правды (пометка `0.0.0-draft`).
- **Switch для nullable boolean-фильтров** — отклонён: «выкл.» выглядит как пусто, но даёт `false`.
- Два отдельных контрола «статус» и «статусы» в UI — сведены к одному multi-select с маппингом ключей.
- Пустые FSD-заглушки (`features/place-bet` с `export {}`), неиспользуемые пакеты (`@tanstack/router-plugin`, router-devtools, `@ant-design/icons`, Testing Library React без UI-тестов) — убраны при зачистке.

## Что проверял особенно внимательно

- Соответствие обязательного стека и именования `*.component.tsx`.
- Контракт list/detail/bets + инвалидация query после ставки.
- Zod-валидация search params с безопасными fallback.
- Edge cases MSW: `hide_bets_history`, `no_view_cargo_price`, `can_set_bet`, 422 по min/max/step.
- Что фильтр по цене не раскрывает скрытую цену.
- `yarn lint` / `yarn test` / `yarn build` на чистом состоянии.
- Адаптивность (desktop / mobile) и ручное тестирование основных сценариев — проходил кандидат сам.

## Какие риски остались

- Draft OpenAPI может разойтись с официальной схемой (имена полей, enum, 422, пагинация).
- Нет e2e / component-тестов UI — только unit на логику.
- Крупный бандл Ant Design без code-splitting маршрутов.
- Node 20 + `ignore-engines` — на другом Node/CI возможны сюрпризы.

## Что улучшить при наличии ещё одного дня

- Подключить официальную OpenAPI и пересверить типы / MSW / Zod.
- Lazy-роуты / code-split для уменьшения бандла.
- Component-тесты критичных виджетов (фильтры, форма ставки).
- Более богатые данные для проверки граничных условий (Finished/Cancelled, несколько waypoint).
