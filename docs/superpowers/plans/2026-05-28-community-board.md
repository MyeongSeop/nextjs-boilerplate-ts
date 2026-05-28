# Community Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public-read, authenticated-write community board with four boards, posts, comments, admin-only notice posting, and an `admin / admin1` login exception.

**Architecture:** Extend the existing Prisma/NextAuth boilerplate with `Board`, `Post`, and `Comment` models plus a small community data layer under `src/lib/community`. Keep reads in App Router pages, mutations in server actions, and enforce authorization inside the mutation helpers. Seed the four boards and the default admin account so local/dev/test environments can run the feature consistently.

**Tech Stack:** Next.js 16 App Router, React 19, NextAuth v5, Prisma, PostgreSQL, Zod, Vitest, shadcn/ui

---

## File structure map

- `prisma/schema.prisma`
  - Add `username` to `User`
  - Add `Board`, `Post`, `Comment`
- `prisma/migrations/<timestamp>_community_board/migration.sql`
  - Persist schema changes
- `package.json`
  - Add a seed command if needed
- `src/lib/auth.ts`
  - Support the `admin` username exception in credentials auth
- `src/actions/auth.ts`
  - Send `identifier` instead of `email` to credentials sign-in
- `src/lib/validations/auth.ts`
  - Adjust login schema to accept identifier semantics while keeping registration email-only
- `src/components/auth/login-form.tsx`
  - Relabel login field so `admin` exception is understandable
- `src/lib/community/boards.ts`
  - Board lookup helpers and permissions
- `src/lib/community/posts.ts`
  - Post reads/writes and ownership checks
- `src/lib/community/comments.ts`
  - Comment reads/writes and ownership checks
- `src/lib/community/seed.ts`
  - Idempotent board/admin seed helpers
- `src/lib/validations/community.ts`
  - Post/comment schemas
- `src/actions/community.ts`
  - Server actions for posts/comments
- `src/components/community/*`
  - Reusable UI for board tabs, lists, forms, and comments
- `src/app/page.tsx`
  - Home page recent posts + board shortcuts
- `src/app/boards/[slug]/page.tsx`
  - Board list page
- `src/app/boards/[slug]/write/page.tsx`
  - Write page
- `src/app/posts/[id]/page.tsx`
  - Post detail + comments
- `src/app/posts/[id]/edit/page.tsx`
  - Edit page
- `src/__tests__/lib/auth-config.test.ts`
  - Extend auth configuration coverage for admin exception
- `src/__tests__/actions/auth.test.ts`
  - Add login behavior coverage
- `src/__tests__/app/root-page.test.tsx`
  - Keep redirect behavior covered
- `src/__tests__/lib/community/*.test.ts`
  - Permission and validation helpers
- `src/__tests__/app/community/*.test.tsx`
  - Rendering/route coverage for board pages

## Task 1: Add failing auth tests for the admin exception

**Files:**
- Modify: `src/__tests__/lib/auth-config.test.ts`
- Modify: `src/__tests__/actions/auth.test.ts`

- [ ] **Step 1: Add a failing auth-config test for admin identifier handling**

```ts
test("authorizes the admin account by username when identifier is admin", async () => {
  const compare = vi.fn().mockResolvedValue(true)
  vi.doMock("bcryptjs", () => ({ default: { compare, hash: vi.fn() } }))
  vi.doMock("@/lib/db", () => ({
    db: {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "admin-id",
          username: "admin",
          email: "admin@example.com",
          password: "hashed-password",
          role: "ADMIN",
        }),
      },
    },
  }))
  const { loginSchema } = await import("@/lib/validations/auth")
  vi.mocked(loginSchema.safeParse).mockReturnValue({
    success: true,
    data: { identifier: "admin", password: "admin1" },
  } as never)

  const authModule = await import("@/lib/auth")
  const config = mocks.nextAuth.mock.calls.at(-1)?.[0]
  const provider = config.providers.find((entry: { id: string }) => entry.id === "credentials")
  const user = await provider.options.authorize({ identifier: "admin", password: "admin1" })

  expect(user).toMatchObject({ email: "admin@example.com", role: "ADMIN" })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/lib/auth-config.test.ts`
Expected: FAIL because `loginSchema` and credentials authorize still expect `email`.

- [ ] **Step 3: Add a failing action test for identifier-based sign-in payload**

```ts
test("passes identifier to signIn during login", async () => {
  const { signIn } = await import("@/lib/auth")
  const fd = new FormData()
  fd.append("identifier", "admin")
  fd.append("password", "admin1")

  await login(fd)

  expect(signIn).toHaveBeenCalledWith(
    "credentials",
    expect.objectContaining({
      identifier: "admin",
      password: "admin1",
      redirectTo: "/dashboard",
    }),
  )
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- src/__tests__/actions/auth.test.ts`
Expected: FAIL because `login()` still sends `email`.

- [ ] **Step 5: Commit after the red tests are captured**

```bash
git add src/__tests__/lib/auth-config.test.ts src/__tests__/actions/auth.test.ts
git commit -m "test: cover admin identifier login"
```

## Task 2: Implement the admin login exception and login-form copy

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/actions/auth.ts`
- Modify: `src/lib/validations/auth.ts`
- Modify: `src/components/auth/login-form.tsx`

- [ ] **Step 1: Update the auth validation schema to use `identifier`**

```ts
export const loginSchema = z.object({
  identifier: z.string().min(1, "로그인 정보를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
})
```

- [ ] **Step 2: Run the targeted auth tests to confirm they still fail for the expected implementation gap**

Run: `npm test -- src/__tests__/lib/auth-config.test.ts src/__tests__/actions/auth.test.ts`
Expected: FAIL with authorize/signIn payload mismatches.

- [ ] **Step 3: Implement the credentials authorize exception in `src/lib/auth.ts`**

```ts
const parsed = loginSchema.safeParse(credentials)
if (!parsed.success) return null

const identifier = parsed.data.identifier.trim()
const where =
  identifier === "admin"
    ? { username: "admin" }
    : { email: identifier.toLowerCase() }

const user = await db.user.findUnique({ where })
```

- [ ] **Step 4: Update `login()` to send `identifier`**

```ts
await signIn("credentials", {
  identifier: parsed.data.identifier,
  password: parsed.data.password,
  redirectTo: "/dashboard",
})
```

- [ ] **Step 5: Update the login form field name and label**

```tsx
<Label htmlFor="identifier">이메일</Label>
<Input id="identifier" name="identifier" required />
<p className="text-xs text-muted-foreground">
  관리자 계정은 admin 으로 로그인합니다.
</p>
```

- [ ] **Step 6: Run the targeted tests to verify they pass**

Run: `npm test -- src/__tests__/lib/auth-config.test.ts src/__tests__/actions/auth.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.ts src/actions/auth.ts src/lib/validations/auth.ts src/components/auth/login-form.tsx src/__tests__/lib/auth-config.test.ts src/__tests__/actions/auth.test.ts
git commit -m "feat: support admin identifier login"
```

## Task 3: Add failing schema tests for community data

**Files:**
- Create: `src/__tests__/validations/community.test.ts`
- Create: `src/lib/validations/community.ts`

- [ ] **Step 1: Write failing tests for board slug, post, and comment validation**

```ts
import { describe, expect, test } from "vitest"
import {
  boardSlugSchema,
  createPostSchema,
  createCommentSchema,
} from "@/lib/validations/community"

describe("community validation", () => {
  test("accepts only supported board slugs", () => {
    expect(boardSlugSchema.safeParse("notice").success).toBe(true)
    expect(boardSlugSchema.safeParse("unknown").success).toBe(false)
  })

  test("requires title and content for posts", () => {
    expect(
      createPostSchema.safeParse({ boardSlug: "free", title: "", content: "" }).success,
    ).toBe(false)
  })

  test("requires content for comments", () => {
    expect(createCommentSchema.safeParse({ postId: "p1", content: "" }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/validations/community.test.ts`
Expected: FAIL because `src/lib/validations/community.ts` does not exist yet.

- [ ] **Step 3: Implement minimal schemas**

```ts
import { z } from "zod"

export const boardSlugSchema = z.enum(["notice", "free", "qna", "attendance"])

export const createPostSchema = z.object({
  boardSlug: boardSlugSchema,
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1),
})

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().trim().min(1),
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/validations/community.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/community.ts src/__tests__/validations/community.test.ts
git commit -m "feat: add community validation schemas"
```

## Task 4: Add Prisma schema and migration for boards, posts, comments, and username

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_community_board/migration.sql`

- [ ] **Step 1: Add a focused schema diff**

```prisma
model User {
  id            String    @id @default(cuid())
  username      String?   @unique
  name          String?
  email         String    @unique
  // ...
  posts         Post[]
  comments      Comment[]
}

model Board {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  posts       Post[]
}

model Post {
  id        String    @id @default(cuid())
  boardId   String
  authorId  String
  title     String
  content   String    @db.Text
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  board     Board     @relation(fields: [boardId], references: [id], onDelete: Cascade)
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Generate the migration**

Run: `npx prisma migrate dev --name community_board`
Expected: a new migration directory containing `username`, `Board`, `Post`, and `Comment` DDL.

- [ ] **Step 3: Inspect the generated SQL**

Run: `Get-Content prisma/migrations/*_community_board/migration.sql`
Expected: `ALTER TABLE "User" ADD COLUMN "username"` plus `CREATE TABLE` for the three community tables and foreign keys.

- [ ] **Step 4: Run Prisma client generation if needed**

Run: `npm run prisma:generate`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add community Prisma models"
```

## Task 5: Add failing seed tests and implement idempotent board/admin seeding

**Files:**
- Create: `src/__tests__/lib/community/seed.test.ts`
- Create: `src/lib/community/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: Write failing tests for board upsert and admin create-if-missing logic**

```ts
import { beforeEach, describe, expect, test, vi } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    board: { upsert: vi.fn() },
    user: { findFirst: vi.fn(), create: vi.fn() },
  },
}))

describe("community seed", () => {
  test("upserts the four default boards", async () => {
    const { seedBoards } = await import("@/lib/community/seed")
    await seedBoards()
    expect(db.board.upsert).toHaveBeenCalledTimes(4)
  })

  test("creates the default admin only when missing", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(null)
    const { seedAdminUser } = await import("@/lib/community/seed")
    await seedAdminUser()
    expect(db.user.create).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/lib/community/seed.test.ts`
Expected: FAIL because the seed module does not exist yet.

- [ ] **Step 3: Implement the minimal seed helper**

```ts
const DEFAULT_BOARDS = [
  { slug: "notice", name: "공지", description: "관리자 공지 게시판" },
  { slug: "free", name: "자유", description: "자유롭게 글을 작성하는 게시판" },
  { slug: "qna", name: "질문", description: "질문과 답변 게시판" },
  { slug: "attendance", name: "출석", description: "출석 체크 게시판" },
]

export async function seedBoards() {
  for (const board of DEFAULT_BOARDS) {
    await db.board.upsert({
      where: { slug: board.slug },
      update: board,
      create: board,
    })
  }
}
```

- [ ] **Step 4: Implement the admin seed**

```ts
export async function seedAdminUser() {
  const existing = await db.user.findFirst({
    where: {
      OR: [{ username: "admin" }, { email: "admin@example.com" }],
    },
  })
  if (existing) return existing

  const password = await bcrypt.hash("admin1", 12)
  return db.user.create({
    data: {
      username: "admin",
      name: "admin",
      email: "admin@example.com",
      password,
      role: Role.ADMIN,
    },
  })
}
```

- [ ] **Step 5: Add an executable seed script entry**

```json
"scripts": {
  "db:seed": "tsx src/lib/community/seed.ts"
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/__tests__/lib/community/seed.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/community/seed.ts src/__tests__/lib/community/seed.test.ts package.json
git commit -m "feat: add community seed helpers"
```

## Task 6: Add failing permission tests for board/post/comment helpers

**Files:**
- Create: `src/__tests__/lib/community/permissions.test.ts`
- Create: `src/lib/community/boards.ts`
- Create: `src/lib/community/posts.ts`
- Create: `src/lib/community/comments.ts`

- [ ] **Step 1: Write failing permission tests**

```ts
describe("community permissions", () => {
  test("rejects anonymous post creation", async () => {
    await expect(assertCanCreatePost(null, "free")).rejects.toThrow("Unauthorized")
  })

  test("rejects non-admin notice post creation", async () => {
    await expect(
      assertCanCreatePost({ user: { id: "u1", role: "USER" } }, "notice"),
    ).rejects.toThrow("Forbidden")
  })

  test("allows admin notice post creation", async () => {
    await expect(
      assertCanCreatePost({ user: { id: "u1", role: "ADMIN" } }, "notice"),
    ).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/lib/community/permissions.test.ts`
Expected: FAIL because helper modules do not exist yet.

- [ ] **Step 3: Implement minimal permission helpers**

```ts
export async function assertCanCreatePost(session: Session | null, boardSlug: BoardSlug) {
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (boardSlug === "notice" && session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden")
  }
}

export async function assertCanWriteComment(session: Session | null) {
  if (!session?.user?.id) throw new Error("Unauthorized")
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/lib/community/permissions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/community/boards.ts src/lib/community/posts.ts src/lib/community/comments.ts src/__tests__/lib/community/permissions.test.ts
git commit -m "feat: add community permission helpers"
```

## Task 7: Add server actions for posts and comments

**Files:**
- Create: `src/actions/community.ts`
- Modify: `src/lib/community/posts.ts`
- Modify: `src/lib/community/comments.ts`

- [ ] **Step 1: Write a failing action test for anonymous comment rejection**

```ts
test("createComment returns an auth error for anonymous users", async () => {
  vi.mocked(auth).mockResolvedValue(null)
  const fd = new FormData()
  fd.append("postId", "post-1")
  fd.append("content", "첫 댓글")

  const result = await createComment(fd)

  expect(result).toEqual({ error: "로그인이 필요합니다." })
})
```

- [ ] **Step 2: Run the targeted action test to verify it fails**

Run: `npm test -- src/__tests__/actions/community.test.ts`
Expected: FAIL because action module does not exist.

- [ ] **Step 3: Implement minimal post/comment actions**

```ts
export async function createPost(formData: FormData) {
  const session = await auth()
  const parsed = createPostSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await assertCanCreatePost(session, parsed.data.boardSlug)
    const board = await getBoardBySlug(parsed.data.boardSlug)
    await createPostRecord({
      boardId: board.id,
      authorId: session!.user!.id!,
      title: parsed.data.title,
      content: parsed.data.content,
    })
    return { success: true }
  } catch (error) {
    return mapCommunityActionError(error)
  }
}
```

- [ ] **Step 4: Run the action tests to verify they pass**

Run: `npm test -- src/__tests__/actions/community.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/actions/community.ts src/lib/community/posts.ts src/lib/community/comments.ts src/__tests__/actions/community.test.ts
git commit -m "feat: add community server actions"
```

## Task 8: Build board and post UI routes

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/boards/[slug]/page.tsx`
- Create: `src/app/boards/[slug]/write/page.tsx`
- Create: `src/app/posts/[id]/page.tsx`
- Create: `src/app/posts/[id]/edit/page.tsx`
- Create: `src/components/community/board-tabs.tsx`
- Create: `src/components/community/post-list.tsx`
- Create: `src/components/community/post-form.tsx`
- Create: `src/components/community/comment-form.tsx`
- Create: `src/components/community/comment-list.tsx`

- [ ] **Step 1: Add a failing render test for the board list page**

```ts
test("board page shows posts and write button for permitted users", async () => {
  const ui = await BoardPage({ params: Promise.resolve({ slug: "free" }) })
  expect(ui).toBeDefined()
})
```

- [ ] **Step 2: Run the targeted route test to verify it fails**

Run: `npm test -- src/__tests__/app/community/board-page.test.tsx`
Expected: FAIL because route/components do not exist.

- [ ] **Step 3: Implement the shared board tabs**

```tsx
export function BoardTabs({ currentSlug }: { currentSlug: BoardSlug }) {
  return (
    <div className="flex gap-2 border-b pb-3">
      {BOARD_NAV_ITEMS.map((board) => (
        <Link
          key={board.slug}
          href={`/boards/${board.slug}`}
          className={cn(
            "px-3 py-1.5 text-sm",
            currentSlug === board.slug ? "font-medium text-foreground" : "text-muted-foreground",
          )}
        >
          {board.label}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Implement the board page and write page minimally**

```tsx
export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const board = await getBoardWithPosts(slug)
  const session = await auth()

  return (
    <div className="space-y-6">
      <BoardTabs currentSlug={board.slug as BoardSlug} />
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{board.name}</h1>
          <p className="text-sm text-muted-foreground">{board.description}</p>
        </div>
        {canRenderWriteButton(session, board.slug) && (
          <Button asChild>
            <Link href={`/boards/${board.slug}/write`}>글쓰기</Link>
          </Button>
        )}
      </div>
      <PostList posts={board.posts} />
    </div>
  )
}
```

- [ ] **Step 5: Implement the post detail page with comments**

```tsx
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(id)
  const session = await auth()

  return (
    <div className="space-y-8">
      <article className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{post.board.name}</p>
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {post.author.name ?? post.author.username ?? post.author.id}
          </p>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-6">{post.content}</div>
      </article>
      <CommentList comments={post.comments} />
      <CommentForm postId={post.id} session={session} />
    </div>
  )
}
```

- [ ] **Step 6: Run the route/component tests to verify they pass**

Run: `npm test -- src/__tests__/app/community/board-page.test.tsx src/__tests__/app/community/post-page.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/app/boards src/app/posts src/components/community src/__tests__/app/community
git commit -m "feat: add community board pages"
```

## Task 9: Seed and verify end-to-end behavior locally

**Files:**
- Modify as needed from previous tasks only if verification exposes a real bug.

- [ ] **Step 1: Seed boards and admin account**

Run: `npm run db:seed`
Expected: the four boards exist and the admin user exists without duplicate rows.

- [ ] **Step 2: Run the full automated suite**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Manually verify local auth and board flows**

Run:

```bash
npm run dev
```

Verify:

- anonymous `/` shows board shortcuts and recent posts
- anonymous can open `/boards/free` and `/posts/<id>`
- ordinary user can write in `free`, `qna`, `attendance`
- ordinary user cannot access `notice` write successfully
- `admin / admin1` logs in successfully
- admin can create in `notice`
- logged-in user can add comments

- [ ] **Step 6: Commit any final fixups from verification**

```bash
git add prisma src package.json
git commit -m "fix: finalize community board flow"
```
