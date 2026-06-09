# World Cup 2026 Prediction Challenge

Mobile-first MVP scaffold for a compliant sports prediction product.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- PostgreSQL
- Prisma
- Stripe Checkout test mode

## Core Product Language

Use only these terms in product copy:

- Prediction Challenge
- Skill-Based Competition
- Leaderboard
- Entry Fee
- Prizes

## Compliance Rules

- Participants must be 18+.
- Access is limited to approved countries.
- Checkout is available only after a complete prediction grid.
- Winners are determined by prediction score and official rules.
- No random selection flow is part of the product.

## Pages

- `/`
- `/rules`
- `/predictions`
- `/participant`
- `/payment`
- `/confirmation`
- `/leaderboard`
- `/results`
- `/admin`

## API Routes

- `GET /api/competitions`
- `POST /api/entries`
- `POST /api/checkout`
- `POST /api/stripe/webhook`
- `GET /api/leaderboard`
- `GET /api/results`
- `POST /api/admin/login`
- `POST /api/admin/competitions`
- `POST /api/admin/matches`
- `POST /api/admin/results`

## Local Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, Stripe test keys, and `ALLOWED_COUNTRIES`.
3. Run `npm install`.
4. Run `npm run db:migrate`.
5. Run `npm run dev`.
