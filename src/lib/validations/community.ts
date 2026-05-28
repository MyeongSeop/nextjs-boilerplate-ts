import { z } from "zod"
import { COMMUNITY_BOARD_SLUGS } from "@/lib/community/boards"

const boardSlugEnum = z.enum(COMMUNITY_BOARD_SLUGS)

export const boardSlugSchema = z.string().trim().toLowerCase().pipe(boardSlugEnum)

export const postTitleSchema = z
  .string()
  .trim()
  .min(1, "제목을 입력해 주세요.")
  .max(120, "제목은 120자 이하여야 합니다.")

export const postContentSchema = z.string().trim().min(1, "내용을 입력해 주세요.")

export const commentContentSchema = z.string().trim().min(1, "댓글 내용을 입력해 주세요.")

export const createPostSchema = z.object({
  boardSlug: boardSlugSchema,
  title: postTitleSchema,
  content: postContentSchema,
})

export const updatePostSchema = z.object({
  postId: z.string().trim().min(1, "寃뚯떆湲??李얠쓣 ???놁뒿?덈떎."),
  title: postTitleSchema,
  content: postContentSchema,
})

export const createCommentSchema = z.object({
  postId: z.string().trim().min(1, "게시글을 찾을 수 없습니다."),
  content: commentContentSchema,
})

export const updateCommentSchema = z.object({
  commentId: z.string().trim().min(1, "?볤???李얠쓣 ???놁뒿?덈떎."),
  content: commentContentSchema,
})

export type BoardSlug = z.infer<typeof boardSlugSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
