# NutriSmart — Telegram Mini App

Монорепозиторий: **frontend (Vite + React + TS)** и **backend (Express + TS + Prisma + SQLite)**.

## Требования

- Node.js 20+ (у вас уже есть)
- Пакетный менеджер: npm / pnpm / yarn

> В текущей среде не найден `npm`. Если вы на своей машине — установите Node.js LTS, либо включите `npm`/`corepack`.

## Быстрый старт (dev)

1) Переменные окружения

```bash
cd nutrimart-mini-app
cp .env.example .env
```

2) Backend

```bash
cd backend
# npm install / pnpm install / yarn
# npm run db:generate
# npm run db:migrate
# npm run db:seed
# npm run dev
```

3) Frontend (в другом терминале)

```bash
cd frontend
# npm install / pnpm install / yarn
# npm run dev
```

Frontend по умолчанию: `http://localhost:3000` (проксирует `/api` на backend `http://localhost:3001`).

## Структура

См. папки `frontend/` и `backend/` — приближено к структуре из ТЗ.

