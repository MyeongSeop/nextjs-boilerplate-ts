import { describe, expect, test } from "vitest"
import { Role } from "@prisma/client"
import { assertCanCreatePostInBoard } from "@/lib/community/boards"
import { assertCanManageComment } from "@/lib/community/comments"
import { assertCanManagePost } from "@/lib/community/posts"

describe("community permissions", () => {
  test("requires login to create board posts", () => {
    expect(() => assertCanCreatePostInBoard(null, "free")).toThrow("로그인이 필요합니다.")
  })

  test("restricts notice posts to admins", () => {
    expect(() =>
      assertCanCreatePostInBoard(
        { user: { id: "user-1", role: Role.USER } } as never,
        "notice",
      ),
    ).toThrow("공지사항은 관리자만 글을 작성할 수 있습니다.")
  })

  test("allows owners and admins to manage posts", () => {
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

  test("allows owners and admins to manage comments", () => {
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
