# Next.js Boilerplate

Next.js 16 App Router boilerplate with:

- Auth.js v5 (`credentials` + optional Google OAuth)
- Prisma + PostgreSQL
- role-based route protection via `src/proxy.ts`
- Tailwind CSS + shadcn/ui
- Vitest

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Fill in environment variables:

```bash
cp .env.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

## Prisma workflow

This repository already includes a baseline migration for the current schema:

- `prisma/migrations/0_init/migration.sql`

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate:status
npm run prisma:migrate:dev -- --name your_change_name
npm run prisma:migrate:deploy
npm run prisma:studio
```

## Vercel deployment

Prisma's current Vercel guidance is to regenerate Prisma Client during builds and apply pending migrations in CI/CD. This repo includes:

- `postinstall`: `prisma generate`
- `vercel-build`: `prisma generate && prisma migrate deploy && next build`

Set the Vercel Build Command to:

```bash
npm run vercel-build
```

Required environment variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if Google login is enabled

For preview deployments, use a separate preview database instead of sharing the production `DATABASE_URL`.

## Verification

```bash
npm run lint
npm run test
npm run build
```
