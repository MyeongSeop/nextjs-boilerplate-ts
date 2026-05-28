# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Production-ready Next.js 15 boilerplate with email/Google auth, PostgreSQL, role-based route protection, and shadcn UI.

**Architecture:** App Router with Server Actions as the primary API layer. NextAuth v5 handles auth with JWT sessions. Prisma manages the PostgreSQL schema. Route protection via middleware.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, next-auth@beta, @auth/prisma-adapter, Prisma, PostgreSQL, Zod, bcryptjs, Vitest

---

## File Map

```
prisma/
  schema.prisma                         # DB schema (User, Account, Session, VerificationToken)

src/
  app/
    layout.tsx                          # Root layout with SessionProvider
    page.tsx                            # Redirect: → /dashboard or /login
    globals.css                         # Tailwind base styles
    (auth)/
      layout.tsx                        # Centered card layout (no navbar)
      login/page.tsx                    # Login page
      register/page.tsx                 # Register page
    (protected)/
      layout.tsx                        # Layout with Navbar
      dashboard/page.tsx                # Post-login landing
      admin/page.tsx                    # Admin-only user list
    api/auth/[...nextauth]/route.ts     # NextAuth handler

  actions/
    auth.ts                             # register(), login() server actions

  components/
    ui/                                 # shadcn auto-generated components
    auth/
      login-form.tsx                    # LoginForm (credentials + Google)
      register-form.tsx                 # RegisterForm
    navbar.tsx                          # Top navigation bar (server component)

  lib/
    auth.ts                             # NextAuth config (providers, callbacks)
    db.ts                               # Prisma singleton
    validations/
      auth.ts                           # Zod schemas: loginSchema, registerSchema

  types/
    next-auth.d.ts                      # Extend NextAuth types with role field

  middleware.ts                         # Route protection

  __tests__/
    setup.ts                            # Vitest + jest-dom setup
    validations/auth.test.ts            # Unit tests for Zod schemas
    actions/auth.test.ts                # Unit tests for register() action

.env.example                            # Environment variable template
vitest.config.ts                        # Vitest configuration
```

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: project root (via `create-next-app`)

- [ ] **Step 1: Create the Next.js app in the current directory**

  Run from `nextjs-boilerplate/`:
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --yes
  ```
  > If prompted about existing files, confirm overwrite (CLAUDE.md will not be touched — it is not a Next.js file).

- [ ] **Step 2: Verify the scaffold**

  ```bash
  ls src/app
  ```
  Expected: `layout.tsx  page.tsx  globals.css  favicon.ico`

- [ ] **Step 3: Commit**

  ```bash
  git init
  git add .
  git commit -m "chore: initialize Next.js 15 app with TypeScript and Tailwind"
  ```

---

## Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install auth and DB packages**

  ```bash
  npm install next-auth@beta @auth/prisma-adapter @prisma/client bcryptjs zod
  npm install -D prisma @types/bcryptjs
  ```

- [ ] **Step 2: Install test packages**

  ```bash
  npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
  ```

- [ ] **Step 3: Add test script to package.json**

  In `package.json`, add to `"scripts"`:
  ```json
  "test": "vitest run",
  "test:watch": "vitest"
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add package.json package-lock.json
  git commit -m "chore: add auth, DB, and test dependencies"
  ```

---

## Task 3: Vitest Configuration

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__tests__/setup.ts`

- [ ] **Step 1: Create vitest.config.ts**

  ```typescript
  // vitest.config.ts
  import { defineConfig } from "vitest/config"
  import react from "@vitejs/plugin-react"
  import path from "path"

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/__tests__/setup.ts"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
  ```

- [ ] **Step 2: Create src/__tests__/setup.ts**

  ```typescript
  import "@testing-library/jest-dom"
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add vitest.config.ts src/__tests__/setup.ts
  git commit -m "chore: configure Vitest with jsdom and jest-dom"
  ```

---

## Task 4: Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Initialize Prisma**

  ```bash
  npx prisma init --datasource-provider postgresql
  ```
  Expected: creates `prisma/schema.prisma` and `.env`

  Rename `.env` to `.env.local`:
  ```bash
  mv .env .env.local
  ```

- [ ] **Step 2: Write prisma/schema.prisma**

  Replace the entire file with:
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

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
    password      String?
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

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  }

  model VerificationToken {
    identifier String
    token      String   @unique
    expires    DateTime

    @@unique([identifier, token])
  }
  ```

- [ ] **Step 3: Set DATABASE_URL in .env.local**

  Edit `.env.local`:
  ```env
  DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
  ```
  Replace with your actual PostgreSQL connection string.

- [ ] **Step 4: Create .env.example**

  ```env
  DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
  NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
  NEXTAUTH_URL="http://localhost:3000"
  GOOGLE_CLIENT_ID=""
  GOOGLE_CLIENT_SECRET=""
  ```

- [ ] **Step 5: Run migration**

  ```bash
  npx prisma migrate dev --name init
  ```
  Expected: `✔ Generated Prisma Client` and migration file created.

- [ ] **Step 6: Commit**

  ```bash
  git add prisma/ .env.example
  git commit -m "feat: add Prisma schema with User, Account, Session models"
  ```
  > Do NOT commit `.env.local`.

---

## Task 5: Prisma Client Singleton

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Create src/lib/db.ts**

  ```typescript
  import { PrismaClient } from "@prisma/client"

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

  export const db = globalForPrisma.prisma ?? new PrismaClient()

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/lib/db.ts
  git commit -m "feat: add Prisma client singleton"
  ```

---

## Task 6: Zod Validation Schemas (TDD)

**Files:**
- Create: `src/lib/validations/auth.ts`
- Create: `src/__tests__/validations/auth.test.ts`

- [ ] **Step 1: Write failing tests**

  Create `src/__tests__/validations/auth.test.ts`:
  ```typescript
  import { describe, test, expect } from "vitest"
  import { loginSchema, registerSchema } from "@/lib/validations/auth"

  describe("loginSchema", () => {
    test("valid credentials pass", () => {
      const result = loginSchema.safeParse({ email: "user@example.com", password: "password123" })
      expect(result.success).toBe(true)
    })

    test("invalid email fails", () => {
      const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" })
      expect(result.success).toBe(false)
    })

    test("empty password fails", () => {
      const result = loginSchema.safeParse({ email: "user@example.com", password: "" })
      expect(result.success).toBe(false)
    })
  })

  describe("registerSchema", () => {
    const valid = {
      name: "Alice",
      email: "alice@example.com",
      password: "securepassword",
      confirmPassword: "securepassword",
    }

    test("valid data passes", () => {
      expect(registerSchema.safeParse(valid).success).toBe(true)
    })

    test("password mismatch fails", () => {
      const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toContain("confirmPassword")
    })

    test("password under 8 chars fails", () => {
      const result = registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" })
      expect(result.success).toBe(false)
    })

    test("name under 2 chars fails", () => {
      const result = registerSchema.safeParse({ ...valid, name: "A" })
      expect(result.success).toBe(false)
    })
  })
  ```

- [ ] **Step 2: Run tests — expect FAIL**

  ```bash
  npx vitest run src/__tests__/validations/auth.test.ts
  ```
  Expected: FAIL — `Cannot find module '@/lib/validations/auth'`

- [ ] **Step 3: Implement src/lib/validations/auth.ts**

  ```typescript
  import { z } from "zod"

  export const loginSchema = z.object({
    email: z.string().email("유효한 이메일을 입력해주세요."),
    password: z.string().min(1, "비밀번호를 입력해주세요."),
  })

  export const registerSchema = z
    .object({
      name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
      email: z.string().email("유효한 이메일을 입력해주세요."),
      password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "비밀번호가 일치하지 않습니다.",
      path: ["confirmPassword"],
    })

  export type LoginInput = z.infer<typeof loginSchema>
  export type RegisterInput = z.infer<typeof registerSchema>
  ```

- [ ] **Step 4: Run tests — expect PASS**

  ```bash
  npx vitest run src/__tests__/validations/auth.test.ts
  ```
  Expected: 7 tests pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/validations/auth.ts src/__tests__/validations/auth.test.ts
  git commit -m "feat: add Zod validation schemas with tests"
  ```

---

## Task 7: NextAuth Type Extensions

**Files:**
- Create: `src/types/next-auth.d.ts`

- [ ] **Step 1: Create src/types/next-auth.d.ts**

  ```typescript
  import { Role } from "@prisma/client"
  import { DefaultSession } from "next-auth"

  declare module "next-auth" {
    interface User {
      role: Role
    }
    interface Session {
      user: DefaultSession["user"] & {
        role: Role
      }
    }
  }

  declare module "next-auth/jwt" {
    interface JWT {
      role: Role
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/types/next-auth.d.ts
  git commit -m "feat: extend NextAuth types with role field"
  ```

---

## Task 8: NextAuth Configuration

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Add NEXTAUTH_SECRET and Google credentials to .env.local**

  ```env
  NEXTAUTH_SECRET="run: openssl rand -base64 32"
  NEXTAUTH_URL="http://localhost:3000"
  GOOGLE_CLIENT_ID="your-google-client-id"
  GOOGLE_CLIENT_SECRET="your-google-client-secret"
  ```
  > Get Google credentials at https://console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client IDs. Set redirect URI to `http://localhost:3000/api/auth/callback/google`.

- [ ] **Step 2: Create src/lib/auth.ts**

  ```typescript
  import NextAuth from "next-auth"
  import { PrismaAdapter } from "@auth/prisma-adapter"
  import Credentials from "next-auth/providers/credentials"
  import Google from "next-auth/providers/google"
  import bcrypt from "bcryptjs"
  import { db } from "./db"
  import { loginSchema } from "./validations/auth"

  export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    pages: {
      signIn: "/login",
    },
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      Credentials({
        async authorize(credentials) {
          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) return null

          const user = await db.user.findUnique({
            where: { email: parsed.data.email },
          })
          if (!user || !user.password) return null

          const valid = await bcrypt.compare(parsed.data.password, user.password)
          if (!valid) return null

          return user
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.role = user.role
        return token
      },
      async session({ session, token }) {
        if (token) session.user.role = token.role
        return session
      },
    },
  })
  ```

- [ ] **Step 3: Create src/app/api/auth/[...nextauth]/route.ts**

  ```typescript
  import { handlers } from "@/lib/auth"
  export const { GET, POST } = handlers
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/lib/auth.ts src/app/api/auth/
  git commit -m "feat: configure NextAuth v5 with Google and Credentials providers"
  ```

---

## Task 9: Server Actions (TDD)

**Files:**
- Create: `src/actions/auth.ts`
- Create: `src/__tests__/actions/auth.test.ts`

- [ ] **Step 1: Write failing tests**

  Create `src/__tests__/actions/auth.test.ts`:
  ```typescript
  import { describe, test, expect, vi, beforeEach } from "vitest"

  vi.mock("@/lib/db", () => ({
    db: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  }))

  vi.mock("bcryptjs", () => ({
    default: {
      hash: vi.fn().mockResolvedValue("hashed_password"),
      compare: vi.fn(),
    },
  }))

  vi.mock("@/lib/auth", () => ({
    signIn: vi.fn(),
  }))

  import { register } from "@/actions/auth"
  import { db } from "@/lib/db"

  describe("register()", () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    test("returns error for invalid input", async () => {
      const fd = new FormData()
      fd.append("name", "A")
      fd.append("email", "not-email")
      fd.append("password", "short")
      fd.append("confirmPassword", "short")

      const result = await register(fd)
      expect(result.error).toBeDefined()
    })

    test("returns error if email already exists", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "1",
        email: "existing@example.com",
      } as any)

      const fd = new FormData()
      fd.append("name", "Alice")
      fd.append("email", "existing@example.com")
      fd.append("password", "password123")
      fd.append("confirmPassword", "password123")

      const result = await register(fd)
      expect(result.error).toBe("이미 사용 중인 이메일입니다.")
    })

    test("creates user and returns success for valid new email", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)
      vi.mocked(db.user.create).mockResolvedValue({
        id: "2",
        email: "new@example.com",
      } as any)

      const fd = new FormData()
      fd.append("name", "Alice")
      fd.append("email", "new@example.com")
      fd.append("password", "password123")
      fd.append("confirmPassword", "password123")

      const result = await register(fd)
      expect(result.success).toBe("계정이 생성되었습니다.")
      expect(db.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Alice",
          email: "new@example.com",
          password: "hashed_password",
        }),
      })
    })
  })
  ```

- [ ] **Step 2: Run tests — expect FAIL**

  ```bash
  npx vitest run src/__tests__/actions/auth.test.ts
  ```
  Expected: FAIL — `Cannot find module '@/actions/auth'`

- [ ] **Step 3: Create src/actions/auth.ts**

  ```typescript
  "use server"

  import { db } from "@/lib/db"
  import { loginSchema, registerSchema } from "@/lib/validations/auth"
  import bcrypt from "bcryptjs"
  import { signIn } from "@/lib/auth"
  import { AuthError } from "next-auth"

  export async function register(formData: FormData) {
    const raw = Object.fromEntries(formData)
    const parsed = registerSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message }
    }

    const { name, email, password } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "이미 사용 중인 이메일입니다." }
    }

    const hashed = await bcrypt.hash(password, 12)
    await db.user.create({ data: { name, email, password: hashed } })

    return { success: "계정이 생성되었습니다." }
  }

  export async function login(formData: FormData) {
    const raw = Object.fromEntries(formData)
    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message }
    }

    try {
      await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirectTo: "/dashboard",
      })
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "이메일 또는 비밀번호가 올바르지 않습니다." }
          default:
            return { error: "로그인 중 오류가 발생했습니다." }
        }
      }
      throw error // NEXT_REDIRECT must be re-thrown
    }
  }
  ```

- [ ] **Step 4: Run tests — expect PASS**

  ```bash
  npx vitest run src/__tests__/actions/auth.test.ts
  ```
  Expected: 3 tests pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/actions/auth.ts src/__tests__/actions/auth.test.ts
  git commit -m "feat: add register and login server actions with tests"
  ```

---

## Task 10: Middleware (Route Protection)

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create src/middleware.ts**

  ```typescript
  import { auth } from "@/lib/auth"
  import { NextResponse } from "next/server"

  export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    const isAuthPage =
      nextUrl.pathname.startsWith("/login") ||
      nextUrl.pathname.startsWith("/register")
    const isAdminPage = nextUrl.pathname.startsWith("/admin")
    const isProtectedPage =
      nextUrl.pathname.startsWith("/dashboard") || isAdminPage

    if (isAuthPage && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    if (isProtectedPage && !isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
    if (isAdminPage && req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  })

  export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/middleware.ts
  git commit -m "feat: add route protection middleware with role-based access"
  ```

---

## Task 11: shadcn Setup

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`, `components.json`
- Create: `src/components/ui/*` (auto-generated)

- [ ] **Step 1: Initialize shadcn**

  ```bash
  npx shadcn@latest init -d
  ```
  > `-d` uses defaults (New York style, Zinc color, CSS variables). Accept all prompts.

- [ ] **Step 2: Install required components**

  ```bash
  npx shadcn@latest add button input label card avatar dropdown-menu sonner
  ```

- [ ] **Step 3: Verify components exist**

  ```bash
  ls src/components/ui
  ```
  Expected: `button.tsx  input.tsx  label.tsx  card.tsx  avatar.tsx  dropdown-menu.tsx  sonner.tsx`

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/ui/ components.json src/app/globals.css tailwind.config.ts
  git commit -m "feat: initialize shadcn/ui with core components"
  ```

---

## Task 12: Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace src/app/layout.tsx**

  ```tsx
  import type { Metadata } from "next"
  import { Inter } from "next/font/google"
  import "./globals.css"
  import { SessionProvider } from "next-auth/react"
  import { Toaster } from "@/components/ui/sonner"

  const inter = Inter({ subsets: ["latin"] })

  export const metadata: Metadata = {
    title: "Next.js Boilerplate",
    description: "Next.js boilerplate with Auth, DB, and shadcn/ui",
  }

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="ko">
        <body className={inter.className}>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </body>
      </html>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/app/layout.tsx
  git commit -m "feat: add SessionProvider and Toaster to root layout"
  ```

---

## Task 13: Auth Components

**Files:**
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`

- [ ] **Step 1: Create src/components/auth/login-form.tsx**

  ```tsx
  "use client"

  import { useState } from "react"
  import { useFormStatus } from "react-dom"
  import { login } from "@/actions/auth"
  import { signIn } from "next-auth/react"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
      </Button>
    )
  }

  export function LoginForm() {
    const [error, setError] = useState<string>()

    async function handleSubmit(formData: FormData) {
      setError(undefined)
      const result = await login(formData)
      if (result?.error) setError(result.error)
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <SubmitButton />
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Google로 계속하기
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <a href="/register" className="text-primary underline">
              회원가입
            </a>
          </p>
        </CardContent>
      </Card>
    )
  }
  ```

- [ ] **Step 2: Create src/components/auth/register-form.tsx**

  ```tsx
  "use client"

  import { useState } from "react"
  import { useFormStatus } from "react-dom"
  import { register } from "@/actions/auth"
  import { useRouter } from "next/navigation"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "가입 중..." : "회원가입"}
      </Button>
    )
  }

  export function RegisterForm() {
    const [error, setError] = useState<string>()
    const [success, setSuccess] = useState<string>()
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
      setError(undefined)
      setSuccess(undefined)
      const result = await register(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(result.success)
        setTimeout(() => router.push("/login"), 1500)
      }
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <SubmitButton />
          </form>
          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <a href="/login" className="text-primary underline">
              로그인
            </a>
          </p>
        </CardContent>
      </Card>
    )
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/auth/
  git commit -m "feat: add LoginForm and RegisterForm components"
  ```

---

## Task 14: Auth Pages & Layout

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create src/app/(auth)/layout.tsx**

  ```tsx
  export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {children}
      </div>
    )
  }
  ```

- [ ] **Step 2: Create src/app/(auth)/login/page.tsx**

  ```tsx
  import { LoginForm } from "@/components/auth/login-form"

  export default function LoginPage() {
    return <LoginForm />
  }
  ```

- [ ] **Step 3: Create src/app/(auth)/register/page.tsx**

  ```tsx
  import { RegisterForm } from "@/components/auth/register-form"

  export default function RegisterPage() {
    return <RegisterForm />
  }
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add "src/app/(auth)/"
  git commit -m "feat: add auth layout and login/register pages"
  ```

---

## Task 15: Navbar Component

**Files:**
- Create: `src/components/navbar.tsx`

- [ ] **Step 1: Create src/components/navbar.tsx**

  ```tsx
  import { auth, signOut } from "@/lib/auth"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Button } from "@/components/ui/button"

  export async function Navbar() {
    const session = await auth()
    const user = session?.user

    return (
      <nav className="border-b px-6 py-3 flex items-center justify-between bg-background">
        <a href="/dashboard" className="font-semibold text-lg">
          MyApp
        </a>
        <div className="flex items-center gap-4">
          {user?.role === "ADMIN" && (
            <a
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </a>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form
                  action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/login" })
                  }}
                >
                  <button type="submit" className="w-full text-left">
                    로그아웃
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/components/navbar.tsx
  git commit -m "feat: add Navbar server component with user dropdown"
  ```

---

## Task 16: Protected Pages & Layout

**Files:**
- Create: `src/app/(protected)/layout.tsx`
- Create: `src/app/(protected)/dashboard/page.tsx`
- Create: `src/app/(protected)/admin/page.tsx`

- [ ] **Step 1: Create src/app/(protected)/layout.tsx**

  ```tsx
  import { Navbar } from "@/components/navbar"

  export default function ProtectedLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-6 py-8">{children}</main>
      </div>
    )
  }
  ```

- [ ] **Step 2: Create src/app/(protected)/dashboard/page.tsx**

  ```tsx
  import { auth } from "@/lib/auth"

  export default async function DashboardPage() {
    const session = await auth()

    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">대시보드</h1>
        <p className="text-muted-foreground">
          안녕하세요,{" "}
          <span className="font-medium text-foreground">
            {session?.user?.name ?? "사용자"}
          </span>
          님!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          역할:{" "}
          <span className="font-mono bg-muted px-1 rounded">
            {session?.user?.role}
          </span>
        </p>
      </div>
    )
  }
  ```

- [ ] **Step 3: Create src/app/(protected)/admin/page.tsx**

  ```tsx
  import { db } from "@/lib/db"

  export default async function AdminPage() {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">관리자 패널</h1>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">이름</th>
                <th className="px-4 py-2 text-left font-medium">이메일</th>
                <th className="px-4 py-2 text-left font-medium">역할</th>
                <th className="px-4 py-2 text-left font-medium">가입일</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-2">{user.name ?? "-"}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className="font-mono bg-muted px-1 rounded text-xs">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {user.createdAt.toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add "src/app/(protected)/"
  git commit -m "feat: add protected layout, dashboard, and admin pages"
  ```

---

## Task 17: Root Page & Final Cleanup

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace src/app/page.tsx**

  ```tsx
  import { redirect } from "next/navigation"
  import { auth } from "@/lib/auth"

  export default async function RootPage() {
    const session = await auth()
    if (session) redirect("/dashboard")
    redirect("/login")
  }
  ```

- [ ] **Step 2: Run all tests**

  ```bash
  npx vitest run
  ```
  Expected: All tests pass (10 tests total).

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/page.tsx
  git commit -m "feat: root page redirects based on auth state"
  ```

---

## Task 18: Smoke Test

- [ ] **Step 1: Start dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Verify routes**

  | URL | Expected |
  |-----|----------|
  | `http://localhost:3000` | Redirects to `/login` |
  | `http://localhost:3000/login` | Login form + Google button |
  | `http://localhost:3000/register` | Register form |
  | `http://localhost:3000/dashboard` (unauthenticated) | Redirects to `/login` |
  | After login | Redirects to `/dashboard`, shows user name + role |
  | `/admin` with USER role | Redirects to `/dashboard` |
  | `/admin` with ADMIN role | Shows user list |

- [ ] **Step 3: Promote a user to ADMIN for testing**

  ```bash
  npx prisma studio
  ```
  In Studio: open User table → set `role` to `ADMIN` for your test user.

- [ ] **Step 4: Final commit**

  ```bash
  git add .
  git commit -m "chore: complete Next.js boilerplate with auth, DB, and UI"
  ```
