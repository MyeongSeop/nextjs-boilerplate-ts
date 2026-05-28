# Community Board Design

## Goal

Add a cafe-style community feature to the existing Next.js authentication boilerplate. The feature must allow public reading, logged-in posting/commenting, and an admin-only notice board. The design should fit the current App Router, NextAuth, Prisma, and server-action based structure without introducing a separate API layer for basic board operations.

## Requirements

### Functional requirements

- Public users can read board lists, post details, and comments.
- Logged-in users can create posts in `free`, `qna`, and `attendance`.
- Logged-in users can create comments on posts.
- Admin users can create posts in `notice` in addition to the other boards.
- Post and comment author display uses `user.name`, falling back to a stable user identifier.
- A default administrator account must exist and authenticate with `admin / admin1`.
- Regular users continue to sign in with email and password.
- The `admin` login is a deliberate exception mapped to the administrator account.

### Initial scope

- Board home with recent posts and board shortcuts.
- Board-specific post list pages.
- Post detail page with comment list and comment form.
- Post write page.
- Post edit/delete and comment edit/delete permission framework for owners.
- No nested comments, likes, search, attachments, or pagination in the first pass.

## Data model

### New Prisma models

#### `Board`

- `id: String`
- `slug: String` unique
- `name: String`
- `description: String?`
- `createdAt: DateTime`
- `updatedAt: DateTime`
- relations:
  - `posts: Post[]`

The initial seeded rows are:

- `notice`
- `free`
- `qna`
- `attendance`

#### `Post`

- `id: String`
- `boardId: String`
- `authorId: String`
- `title: String`
- `content: String`
- `createdAt: DateTime`
- `updatedAt: DateTime`
- relations:
  - `board: Board`
  - `author: User`
  - `comments: Comment[]`

#### `Comment`

- `id: String`
- `postId: String`
- `authorId: String`
- `content: String`
- `createdAt: DateTime`
- `updatedAt: DateTime`
- relations:
  - `post: Post`
  - `author: User`

### Updates to `User`

Add:

- `posts: Post[]`
- `comments: Comment[]`
- `username: String? @unique`

`username` is optional for ordinary users and reserved for the seeded admin account. The admin user will use `username = "admin"` and still keep a valid email in the database for consistency.

## Authentication design

### Existing flow

The current credentials provider validates an email and password pair against Prisma.

### New rule

- If the submitted identifier is exactly `admin`, authenticate against the admin account by `username`.
- Otherwise, preserve existing email-based authentication behavior.
- Registration remains email-based only.

### Admin seed

Create a startup-safe seed path that ensures an admin account exists:

- `username: "admin"`
- `name: "admin"`
- `email: "admin@example.com"`
- `password: bcrypt("admin1")`
- `role: ADMIN`

The seed must be idempotent and must not overwrite a manually changed admin password in normal operation. It should create the account only when it does not already exist.

## Authorization rules

### Public

- Read board list
- Read post list
- Read post detail
- Read comments

### Authenticated user

- Create posts in `free`, `qna`, `attendance`
- Create comments
- Edit/delete own posts
- Edit/delete own comments

### Admin

- All authenticated-user actions
- Create posts in `notice`

### Enforcement

Authorization must be enforced in server actions and data mutation helpers, not only in page rendering. UI hiding is convenience only, not security.

## Routes

### Public routes

- `/`
  - Community landing section with recent posts and board shortcuts.
- `/boards/[slug]`
  - Posts list for a board.
- `/posts/[id]`
  - Post detail with comments.

### Authenticated routes

- `/boards/[slug]/write`
  - New post form.
- `/posts/[id]/edit`
  - Post edit form.

Comment edit/delete can start as inline owner controls on `/posts/[id]` to keep route count low.

## UI design

### Overall tone

Keep the existing restrained product UI. Avoid a decorative forum style. Use simple list/table presentation with clear actions.

### Home page

- Board shortcuts near the top.
- Recent posts section grouped or tagged by board.
- Sign-in prompt for anonymous users who want to participate.

### Board page

- Board header with name and description.
- Board switcher for `notice`, `free`, `qna`, `attendance` with Korean labels in the UI.
- Post list with:
  - title
  - author
  - created date
  - comment count
- Write button shown only when the current user has permission for that board.

### Post detail

- Title
- Board badge
- Author display
- Created/updated timestamps
- Body content
- Owner controls where applicable
- Comment list
- Comment form for logged-in users
- Login prompt for anonymous users

### Author display

Use:

1. `user.name` when present
2. `user.username` when present
3. `user.id`

This keeps admin readable while preserving a fallback for existing users without names.

## Server actions and validation

### Actions

Add actions for:

- create post
- update post
- delete post
- create comment
- update comment
- delete comment

### Validation

Use Zod schemas for:

- board slug checks
- post title length
- post content presence
- comment content presence

### Data access

Keep actions thin. Put Prisma-heavy reads/writes and permission checks into focused server-side helpers under `src/lib` or `src/lib/community` so pages and actions stay readable.

## Migration and seed strategy

### Prisma

- Add new models and relations to `schema.prisma`
- Create a migration

### Seeding

Introduce a seed script or startup-safe helper for:

- fixed boards
- default admin account

The board seed must upsert by `slug`. The admin seed must create only if missing.

## Testing strategy

### Automated tests

- auth regression tests for `admin / admin1`
- root redirect tests remain unchanged for anonymous/authenticated flows
- permission tests:
  - anonymous cannot create posts/comments
  - user cannot write in `notice`
  - admin can write in `notice`
- board/post/comment validation tests

### Manual verification

- anonymous user can browse all boards and post detail pages
- ordinary user can write in `free`, `qna`, `attendance`
- ordinary user is blocked from `notice`
- admin can sign in with `admin / admin1`
- admin can write in `notice`
- logged-in users can add comments

## File structure impact

Likely additions:

- `src/app/boards/[slug]/page.tsx`
- `src/app/boards/[slug]/write/page.tsx`
- `src/app/posts/[id]/page.tsx`
- `src/app/posts/[id]/edit/page.tsx`
- `src/components/community/*`
- `src/actions/community.ts`
- `src/lib/community/*`
- `src/lib/validations/community.ts`
- migration and seed files

## Risks and constraints

- Existing login UI currently assumes email labeling, so the admin exception should be communicated in the UI without making regular login confusing.
- The project currently has some broken Korean copy. Community screens should use clean Korean text rather than inheriting mojibake.
- Seeding admin credentials must be explicit and limited so production behavior is predictable.
- Because boards are public-read, write controls must be clearly separated from read views to avoid accidental permission leaks in UI logic.

## Recommended implementation order

1. Add Prisma schema changes and migration.
2. Add board/admin seed support.
3. Extend credential auth for the admin exception.
4. Add community validation and server-side data helpers.
5. Add server actions.
6. Build board/post/comment UI.
7. Add permission and auth regression tests.
8. Verify locally with authenticated and anonymous flows.
