# Next.js Boilerplate Design

**Date:** 2026-05-28

## Overview

A production-ready Next.js boilerplate with authentication, database, and UI foundations. Designed to be cloned and extended quickly without rearchitecting the core.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Auth | NextAuth v5 / Auth.js (`next-auth@beta`) |
| Database | PostgreSQL |
| ORM | Prisma |
| Deployment | Vercel |
| Validation | Zod |

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── api/
│   │   └── auth/[...nextauth]/
│   ├── layout.tsx
│   └── page.tsx
├── actions/
│   └── auth.ts
├── components/
│   ├── ui/              # shadcn components
│   └── auth/            # LoginForm, RegisterForm
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── validations/
└── middleware.ts
prisma/
└── schema.prisma
```

## Data Model

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // null for OAuth-only users
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Key decisions:**
- `password` is nullable — Google OAuth users have no password
- `role` lives directly on `User` — no separate roles table needed for 2-tier access
- NextAuth Prisma Adapter manages Account/Session/VerificationToken automatically

## Auth Flow

### Providers
- **Credentials**: email + password → bcrypt verify → return User object
- **Google OAuth**: auto-creates or links existing account via email

### Server Actions (`actions/auth.ts`)
- `register(data)` — Zod validate → check email uniqueness → bcrypt hash → create User
- `login(data)` — Zod validate → call NextAuth `signIn("credentials", ...)`

### Session
- JWT strategy with `role` injected into token via `jwt` callback
- `session.user.role` available in both server and client components

### Middleware (`middleware.ts`)
| Path | Unauthenticated | Authenticated (non-admin) |
|------|----------------|--------------------------|
| `/login`, `/register` | allow | redirect → `/dashboard` |
| `/(protected)/*` | redirect → `/login` | allow |
| `/admin/*` | redirect → `/login` | redirect → `/dashboard` |
| `/` | redirect → `/login` | redirect → `/dashboard` |

## UI Components

### shadcn components installed
`Button`, `Input`, `Label`, `Form`, `Card`, `CardHeader`, `CardContent`, `Avatar`, `DropdownMenu`, `Sonner`

### Pages
- `/login` — email/password form + "Continue with Google" button
- `/register` — name / email / password form
- `/dashboard` — post-login landing, shows user name and role
- `/admin` — admin-only page with a minimal user list example

### Layouts
- `(auth)` layout — centered card, no navbar
- `(protected)` layout — top Navbar with user avatar dropdown (profile, logout)

## Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Out of Scope

- Email verification flow
- Password reset / forgot password
- Billing / subscription
- i18n
- Testing setup
