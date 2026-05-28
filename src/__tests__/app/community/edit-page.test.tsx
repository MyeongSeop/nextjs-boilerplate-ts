import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

const mockRouter = {
  push: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
}

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getPostForEdit: vi.fn(),
  updatePost: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}))

vi.mock("@/lib/auth", () => ({
  auth: mocks.auth,
}))

vi.mock("@/lib/community/posts", () => ({
  getPostForEdit: mocks.getPostForEdit,
}))

vi.mock("@/actions/community", () => ({
  updatePost: mocks.updatePost,
}))

import EditPostPage from "@/app/posts/[id]/edit/page"

describe("community post edit page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("renders the post edit form for the owner", async () => {
    mocks.auth.mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    } as never)
    mocks.getPostForEdit.mockResolvedValue({
      id: "post-1",
      title: "Edit title",
      content: "Edit body",
      updatedAt: new Date("2026-05-28T10:00:00.000Z"),
      board: { slug: "free", name: "자유" },
      authorId: "user-1",
    } as never)

    render(await EditPostPage({ params: Promise.resolve({ id: "post-1" }) }))

    expect(screen.getByRole("heading", { name: "글 수정" })).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toHaveValue("Edit title")
    expect(screen.getByDisplayValue("Edit body")).toBeInTheDocument()
  })
})
