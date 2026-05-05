## Meal Planner MVP

Production-ready MVP for personal meal planning with:

- Google authentication via NextAuth
- reusable meal templates
- dynamic timeline scheduling (`startDate` + `durationDays`)
- cascading push-forward rescheduling for skipped days
- planned vs actual meal history
- dark premium dashboard with meal and ingredient stats

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth (Google)
- Recharts

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Fill in Google OAuth values in `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `DATABASE_URL`

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client and apply DB migration:

```bash
npm run db:generate
npm run db:migrate
```

5. Optional seed data:

```bash
npm run db:seed
```

6. Start app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Surface

- `GET/POST /api/templates`
- `PUT/DELETE /api/templates/:id`
- `GET/POST /api/schedule`
- `POST /api/schedule/push` (cascading shift)
- `GET/POST /api/history`
- `GET /api/dashboard/stats`
