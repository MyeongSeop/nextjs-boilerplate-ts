import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getBoardBySlug: vi.fn(),
  createPost: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  auth: mocks.auth,
}))

vi.mock("@/lib/community/boards", () => ({
  getBoardBySlug: mocks.getBoardBySlug,
  canRenderWriteButton: vi.fn(() => false),
}))

vi.mock("@/actions/community", () => ({
  createPost: mocks.createPost,
}))

import WritePostPage from "@/app/boards/[slug]/write/page"

describe("community write page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("shows the access prompt for a regular user on notice", async () => {
    mocks.auth.mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    } as never)
    mocks.getBoardBySlug.mockResolvedValue({
      id: "board-1",
      slug: "notice",
      name: "공지",
      description: "공지 게시판입니다.",
    } as never)

    render(await WritePostPage({ params: Promise.resolve({ slug: "notice" }) }))

    expect(screen.getByRole("heading", { name: "글쓰기" })).toBeInTheDocument()
    expect(screen.getByText("글쓰기를 사용할 수 없습니다.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login")
    expect(screen.getByRole("link", { name: "목록으로" })).toHaveAttribute(
      "href",
      "/boards/notice",
    )
  })
})
