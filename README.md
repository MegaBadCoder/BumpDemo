# BumpDemo

Fullstack-приложение на [Nuxt 4](https://nuxt.com): фронтенд (`app/`) и бэкенд (`server/`, Nitro) в одном проекте. База данных, авторизация и хранилище — [Supabase](https://supabase.com) через модуль [`@nuxtjs/supabase`](https://supabase.nuxtjs.org).

## Структура

- `app/` — страницы и компоненты Vue
- `server/api/` — API-роуты бэкенда (например, `GET /api/health`)
- `server/utils/` — подбор событий (`afisha.ts`) и разбор запроса моделью (`ai-parse-query.ts`)
- `server/mock/` — заглушки событий и источников, пока их нет в Supabase
- `shared/` — типы и утилиты, общие для страниц и сервера
- `.mcp.json` — Supabase MCP-сервер для Claude Code
- `.claude/skills/` — Supabase Agent Skills (`skills-lock.json` фиксирует версии)

## Запуск

```bash
npm install
cp .env.example .env   # заполнить ключи из Supabase → Project Settings → API
npm run dev            # http://localhost:3000
```

Сборка: `npm run build`, предпросмотр: `npm run preview`.

## Переменные окружения

| Переменная | Где используется |
| --- | --- |
| `NUXT_PUBLIC_SUPABASE_URL` | клиент и сервер |
| `NUXT_PUBLIC_SUPABASE_KEY` | publishable-ключ, клиент и сервер |
| `NUXT_SUPABASE_SECRET_KEY` | только сервер (`serverSupabaseServiceRole`) |
| `NUXT_AI_API_KEY` | ключ [Polza.ai](https://polza.ai) для разбора запроса, только сервер; по умолчанию демо-ключ из `nuxt.config.ts` |
| `NUXT_AI_MODEL` | модель для разбора запроса, по умолчанию `anthropic/claude-sonnet-5` |

## Страницы и заглушки

Страницы MVP — по доске в Miro (фрейм «Состав страниц»): главная `/`, выдача `/search`, карточка события `/event/:id`, источники `/sources`, плюс список всех событий `/events`.

- События и источники — заглушки из `server/mock/`, об этом предупреждает полоса вверху страниц. Чтобы перейти на Supabase, меняется только `server/utils/afisha.ts`.
- Запрос обычными словами разбирает модель через Polza.ai в условия поиска (чипы на выдаче). Если модель не ответила, срабатывает разбор правилами (`server/utils/parse-query.ts`), и выдача пишет, что запрос разобран упрощённо.
- Разделы не из MVP (`/evening`, `/collection/:slug`, `/submit`, `/promote`) — страницы-заглушки с описанием, что там будет.

## Claude Code + Supabase MCP

MCP-сервер уже прописан в `.mcp.json`. Один раз авторизуйтесь в обычном терминале:

```bash
claude /mcp
```

Выберите `supabase` → Authenticate.

## Лицензия

[MIT](LICENSE)
