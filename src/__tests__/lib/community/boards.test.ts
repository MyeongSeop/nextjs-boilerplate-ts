import { beforeEach, describe, expect, test, vi } from "vitest"
import { Role } from "@prisma/client"

vi.mock("@/lib/db", () => ({
  db: {
    board: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"
import {
  assertCanCreatePostInBoard,
  getCommunityBoardBySlug,
  getCommunityBoards,
} from "@/lib/community/boards"

describe("community boards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("loads boards in creation order", async () => {
    vi.mocked(db.board.findMany).mockResolvedValue([] as never)

    await getCommunityBoards()

    expect(db.board.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "asc" },
    })
  })

  test("loads a board by slug", async () => {
    vi.mocked(db.board.findUnique).mockResolvedValue({ id: "board-1" } as never)

    await getCommunityBoardBySlug("free")

    expect(db.board.findUnique).toHaveBeenCalledWith({
      where: { slug: "free" },
    })
  })

  test("rejects anonymous post creation", () => {
    expect(() => assertCanCreatePostInBoard(null, "free")).toThrow("로그인이 필요합니다.")
  })

  test("rejects non-admin notice posts", () => {
    expect(() =>
      assertCanCreatePostInBoard(
        { user: { id: "user-1", role: Role.USER } } as never,
        "notice",
      ),
    ).toThrow("공지사항은 관리자만 글을 작성할 수 있습니다.")
  })

  test("allows admin notice posts", () => {
    expect(() =>
      assertCanCreatePostInBoard(
        { user: { id: "admin-1", role: Role.ADMIN } } as never,
        "notice",
      ),
    ).not.toThrow()
  })

  test("allows regular users to write on non-notice boards", () => {
    expect(() =>
      assertCanCreatePostInBoard({ user: { id: "user-1", role: Role.USER } } as never, "free"),
    ).not.toThrow()
  })
})
