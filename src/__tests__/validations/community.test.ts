import { describe, expect, test } from "vitest"
import {
  boardSlugSchema,
  createCommentSchema,
  createPostSchema,
  updateCommentSchema,
  updatePostSchema,
} from "@/lib/validations/community"

describe("community validation", () => {
  test("accepts only supported board slugs", () => {
    expect(boardSlugSchema.safeParse("notice").success).toBe(true)
    expect(boardSlugSchema.safeParse("unknown").success).toBe(false)
  })

  test("requires title and content for posts", () => {
    expect(
      createPostSchema.safeParse({
        boardSlug: "free",
        title: "",
        content: "",
      }).success,
    ).toBe(false)
  })

  test("requires content for comments", () => {
    expect(createCommentSchema.safeParse({ postId: "p1", content: "" }).success).toBe(false)
  })

  test("requires ids for edit schemas", () => {
    expect(
      updatePostSchema.safeParse({
        postId: "p1",
        title: "Edit title",
        content: "Edit body",
      }).success,
    ).toBe(true)

    expect(
      updateCommentSchema.safeParse({
        commentId: "c1",
        content: "Edit comment",
      }).success,
    ).toBe(true)
  })
})
