import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getBoardWithPosts: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  auth: mocks.auth,
}))

vi.mock("@/lib/community/posts", () => ({
  getBoardWithPosts: mocks.getBoardWithPosts,
}))

import BoardPage from "@/app/boards/[slug]/page"

describe("community board page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("renders the board header, post list, and write button for a logged-in user", async () => {
    mocks.auth.mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    } as never)
    mocks.getBoardWithPosts.mockResolvedValue({
      id: "board-1",
      slug: "free",
      name: "자유",
      description: "자유 게시판입니다.",
      posts: [
        {
          id: "post-1",
          title: "안녕하세요",
          createdAt: new Date("2026-05-28T09:00:00.000Z"),
          board: { slug: "free", name: "자유" },
          author: { id: "user-2", name: "작성자" },
          _count: { comments: 1 },
        },
      ],
    } as never)

    render(await BoardPage({ params: Promise.resolve({ slug: "free" }) }))

    expect(screen.getByRole("heading", { name: "자유" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "글쓰기" })).toHaveAttribute(
      "href",
      "/boards/free/write",
    )
    expect(screen.getByRole("link", { name: "안녕하세요" })).toHaveAttribute(
      "href",
      "/posts/post-1",
    )
    expect(screen.getByText("댓글 1")).toBeInTheDocument()
  })
})

