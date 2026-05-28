import { beforeEach, describe, expect, test, vi } from "vitest"
import { Role } from "@prisma/client"

vi.mock("@/lib/db", () => ({
  db: {
    comment: {
      findMany: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"
import {
  assertCanManageComment,
  getCommunityCommentsByPostId,
} from "@/lib/community/comments"

describe("community comments", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("loads comments for a post with authors", async () => {
    vi.mocked(db.comment.findMany).mockResolvedValue([] as never)

    await getCommunityCommentsByPostId("post-1")

    expect(db.comment.findMany).toHaveBeenCalledWith({
      where: {
        postId: "post-1",
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })
  })

  test("rejects anonymous comment edits", () => {
    expect(() =>
      assertCanManageComment(null, {
        id: "comment-1",
        postId: "post-1",
        authorId: "user-1",
        content: "content",
      }),
    ).toThrow("로그인이 필요합니다.")
  })

  test("rejects non-owners from editing comments", () => {
    expect(() =>
      assertCanManageComment(
        { user: { id: "user-2", role: Role.USER } } as never,
        {
          id: "comment-1",
          postId: "post-1",
          authorId: "user-1",
          content: "content",
        },
      ),
    ).toThrow("권한이 없습니다.")
  })

  test("allows owners and admins to edit comments", () => {
    expect(() =>
      assertCanManageComment(
        { user: { id: "user-1", role: Role.USER } } as never,
        {
          id: "comment-1",
          postId: "post-1",
          authorId: "user-1",
          content: "content",
        },
      ),
    ).not.toThrow()

    expect(() =>
      assertCanManageComment(
        { user: { id: "admin-1", role: Role.ADMIN } } as never,
        {
          id: "comment-1",
          postId: "post-1",
          authorId: "user-1",
          content: "content",
        },
      ),
    ).not.toThrow()
  })
})
