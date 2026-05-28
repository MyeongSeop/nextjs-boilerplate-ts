import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getRecentPosts: vi.fn(),
  PostList: vi.fn(({ posts }: { posts: Array<{ id: string; title: string; _count?: { comments?: number } }> }) => (
    <div data-testid="post-list">
      {posts.map((post) => (
        <article key={post.id}>
          <a href={`/posts/${post.id}`}>{post.title}</a>
          <span>{`댓글 ${post._count?.comments ?? 0}`}</span>
        </article>
      ))}
    </div>
  )),
}))

vi.mock("@/lib/auth", () => ({
  auth: mocks.auth,
}))

vi.mock("@/lib/community/posts", () => ({
  getRecentPosts: mocks.getRecentPosts,
}))

vi.mock("@/components/community/post-list", () => ({
  PostList: mocks.PostList,
}))

import HomePage from "@/app/page"

describe("root page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("renders the community entry points and recent posts", async () => {
    const recentPosts = [
      {
        id: "post-1",
        title: "첫 글",
        content: "본문",
        createdAt: new Date("2026-05-28T09:00:00.000Z"),
        board: { slug: "free", name: "자유" },
        author: { id: "user-2", name: "작성자", username: null },
        _count: { comments: 2 },
      },
    ]

    mocks.auth.mockResolvedValue({
      user: {
        id: "user-1",
        name: "사용자",
        role: "USER",
      },
    } as never)
    mocks.getRecentPosts.mockResolvedValue(recentPosts as never)

    render(await HomePage())

    expect(screen.getByRole("heading", { name: "게시판 바로가기" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "자유 게시판 보기" })).toHaveAttribute(
      "href",
      "/boards/free",
    )
    expect(screen.getByRole("link", { name: "첫 글" })).toHaveAttribute("href", "/posts/post-1")
    expect(screen.getByText("댓글 2")).toBeInTheDocument()
    expect(mocks.getRecentPosts).toHaveBeenCalledWith(8)
    expect(mocks.PostList).toHaveBeenCalledWith({ posts: recentPosts }, undefined)
  })
})
