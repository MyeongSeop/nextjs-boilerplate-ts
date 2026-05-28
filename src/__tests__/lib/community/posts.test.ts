import { beforeEach, describe, expect, test, vi } from "vitest"
import { Role } from "@prisma/client"

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"
import {
  assertCanManagePost,
  getCommunityAuthorDisplayName,
  getCommunityPostById,
  getCommunityPostsByBoardSlug,
} from "@/lib/community/posts"

describe("community posts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("prefers name, then username, then id for author labels", () => {
    expect(
      getCommunityAuthorDisplayName({
        id: "user-3",
        name: "  홍길동  ",
        username: "hong",
      }),
    ).toBe("홍길동")
    expect(
      getCommunityAuthorDisplayName({
        id: "user-3",
        username: "hong",
      }),
    ).toBe("hong")
    expect(getCommunityAuthorDisplayName({ id: "user-3" })).toBe("user-3")
  })

  test("loads board posts with author and board relations", async () => {
    vi.mocked(db.post.findMany).mockResolvedValue([] as never)

    await getCommunityPostsByBoardSlug("free")

    expect(db.post.findMany).toHaveBeenCalledWith({
      where: {
        board: {
          slug: "free",
        },
      },
      include: {
        board: true,
        author: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  })

  test("loads a post detail with comments and authors", async () => {
    vi.mocked(db.post.findUnique).mockResolvedValue(null as never)

    await getCommunityPostById("post-1")

    expect(db.post.findUnique).toHaveBeenCalledWith({
      where: { id: "post-1" },
      include: {
        board: true,
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })
  })

  test("rejects anonymous post edits", () => {
    expect(() =>
      assertCanManagePost(null, {
        id: "post-1",
        boardId: "board-1",
        authorId: "user-1",
        title: "title",
        content: "content",
      }),
    ).toThrow("로그인이 필요합니다.")
  })

  test("rejects non-owners from editing posts", () => {
    expect(() =>
      assertCanManagePost(
        { user: { id: "user-2", role: Role.USER } } as never,
        {
          id: "post-1",
          boardId: "board-1",
          authorId: "user-1",
          title: "title",
          content: "content",
        },
      ),
    ).toThrow("권한이 없습니다.")
  })

  test("allows owners and admins to edit posts", () => {
    expect(() =>
      assertCanManagePost(
        { user: { id: "user-1", role: Role.USER } } as never,
        {
          id: "post-1",
          boardId: "board-1",
          authorId: "user-1",
          title: "title",
          content: "content",
        },
      ),
    ).not.toThrow()

    expect(() =>
      assertCanManagePost(
        { user: { id: "admin-1", role: Role.ADMIN } } as never,
        {
          id: "post-1",
          boardId: "board-1",
          authorId: "user-1",
          title: "title",
          content: "content",
        },
      ),
    ).not.toThrow()
  })
})
