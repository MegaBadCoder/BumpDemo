# BumpDemo

Fullstack-приложение на [Nuxt 4](https://nuxt.com): фронтенд (`app/`) и бэкенд (`server/`, Nitro) в одном проекте. База данных, авторизация и хранилище — [Supabase](https://supabase.com) через модуль [`@nuxtjs/supabase`](https://supabase.nuxtjs.org).

## Структура

- `app/` — страницы и компоненты Vue
- `server/api/` — API-роуты бэкенда (например, `GET /api/health`)
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

## Claude Code + Supabase MCP

MCP-сервер уже прописан в `.mcp.json`. Один раз авторизуйтесь в обычном терминале:

```bash
claude /mcp
```

Выберите `supabase` → Authenticate.

## Лицензия

[MIT](LICENSE)
