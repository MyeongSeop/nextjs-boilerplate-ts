import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getPostById: vi.fn(),
  createComment: vi.fn(),
  deleteComment: vi.fn(),
  deletePost: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
}))

vi.mock("@/lib/auth", () => ({
  auth: mocks.auth,
}))

vi.mock("@/lib/community/posts", () => ({
  getPostById: mocks.getPostById,
}))

vi.mock("@/actions/community", () => ({
  createComment: mocks.createComment,
  deleteComment: mocks.deleteComment,
  deletePost: mocks.deletePost,
}))

import PostPage from "@/app/posts/[id]/page"

describe("community post page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("renders the post body and a login prompt for anonymous users", async () => {
    mocks.auth.mockResolvedValue(null)
    mocks.getPostById.mockResolvedValue({
      id: "post-1",
      title: "First post",
      content: "Body text",
      createdAt: new Date("2026-05-28T09:00:00.000Z"),
      updatedAt: new Date("2026-05-28T10:00:00.000Z"),
      board: { slug: "free", name: "자유" },
      author: { id: "user-1", name: null, username: null },
      comments: [
        {
          id: "comment-1",
          content: "Comment text",
          createdAt: new Date("2026-05-28T11:00:00.000Z"),
          authorId: "user-2",
          author: { id: "user-2", name: "Writer", username: null },
        },
      ],
    } as never)

    render(await PostPage({ params: Promise.resolve({ id: "post-1" }) }))

    expect(screen.getByRole("heading", { name: "First post" })).toBeInTheDocument()
    expect(screen.getByText("Body text")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login")
    expect(screen.getByText("Comment text")).toBeInTheDocument()
    expect(screen.getByText("Writer")).toBeInTheDocument()
  })
})
