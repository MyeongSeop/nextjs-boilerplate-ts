"use server"

import { auth } from "@/lib/auth"
import {
  assertCanCreatePost,
  assertCanManagePost,
  createPostRecord,
  deletePostRecord,
  getPostForEdit,
  parseCreatePostInput,
  parseUpdatePostInput,
  updatePostRecord,
} from "@/lib/community/posts"
import {
  assertCanManageComment,
  assertCanWriteComment,
  createCommentRecord,
  deleteCommentRecord,
  getCommentById,
  parseCreateCommentInput,
  parseUpdateCommentInput,
  updateCommentRecord,
} from "@/lib/community/comments"
import { getBoardBySlug } from "@/lib/community/boards"
import { getPostById } from "@/lib/community/posts"

function mapCommunityError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return { error: "로그인이 필요합니다." }
    }
    if (error.message === "Forbidden") {
      return { error: "권한이 없습니다." }
    }
    return { error: error.message }
  }

  return { error: "알 수 없는 오류가 발생했습니다." }
}

export async function createPost(formData: FormData) {
  const parsed = parseCreatePostInput(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." }
  }

  const session = await auth()

  try {
    await assertCanCreatePost(session, parsed.data.boardSlug)
    const board = await getBoardBySlug(parsed.data.boardSlug)
    if (!board) {
      return { error: "게시판을 찾을 수 없습니다." }
    }

    const post = await createPostRecord({
      boardId: board.id,
      authorId: session!.user!.id!,
      title: parsed.data.title,
      content: parsed.data.content,
    })

    return { success: true, postId: post.id }
  } catch (error) {
    return mapCommunityError(error)
  }
}

export async function updatePost(formData: FormData) {
  const parsed = parseUpdatePostInput(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." }
  }

  const session = await auth()

  try {
    const post = await getPostForEdit(parsed.data.postId)
    if (!post) {
      return { error: "게시글을 찾을 수 없습니다." }
    }

    await assertCanManagePost(session, {
      id: post.id,
      boardId: post.boardId,
      authorId: post.authorId,
      title: post.title,
      content: post.content,
    })

    await updatePostRecord({
      postId: parsed.data.postId,
      title: parsed.data.title,
      content: parsed.data.content,
    })

    return { success: true, postId: parsed.data.postId }
  } catch (error) {
    return mapCommunityError(error)
  }
}

export async function deletePost(formData: FormData) {
  const postId = String(formData.get("postId") ?? "").trim()
  if (!postId) {
    return { error: "잘못된 요청입니다." }
  }

  const session = await auth()

  try {
    const post = await getPostForEdit(postId)
    if (!post) {
      return { error: "게시글을 찾을 수 없습니다." }
    }

    await assertCanManagePost(session, {
      id: post.id,
      boardId: post.boardId,
      authorId: post.authorId,
      title: post.title,
      content: post.content,
    })

    await deletePostRecord(postId)
    return { success: true }
  } catch (error) {
    return mapCommunityError(error)
  }
}

export async function createComment(formData: FormData) {
  const parsed = parseCreateCommentInput(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." }
  }

  const session = await auth()

  try {
    await assertCanWriteComment(session)
    const post = await getPostById(parsed.data.postId)
    if (!post) {
      return { error: "게시글을 찾을 수 없습니다." }
    }

    const comment = await createCommentRecord({
      postId: parsed.data.postId,
      authorId: session!.user!.id!,
      content: parsed.data.content,
    })

    return { success: true, commentId: comment.id }
  } catch (error) {
    return mapCommunityError(error)
  }
}

export async function updateComment(formData: FormData) {
  const parsed = parseUpdateCommentInput(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." }
  }

  const session = await auth()

  try {
    const comment = await getCommentById(parsed.data.commentId)
    if (!comment) {
      return { error: "댓글을 찾을 수 없습니다." }
    }

    await assertCanManageComment(session, {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
    })

    await updateCommentRecord({
      commentId: parsed.data.commentId,
      content: parsed.data.content,
    })

    return { success: true, commentId: parsed.data.commentId }
  } catch (error) {
    return mapCommunityError(error)
  }
}

export async function deleteComment(formData: FormData) {
  const commentId = String(formData.get("commentId") ?? "").trim()
  if (!commentId) {
    return { error: "잘못된 요청입니다." }
  }

  const session = await auth()

  try {
    const comment = await getCommentById(commentId)
    if (!comment) {
      return { error: "댓글을 찾을 수 없습니다." }
    }

    await assertCanManageComment(session, {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
    })

    await deleteCommentRecord(commentId)
    return { success: true }
  } catch (error) {
    return mapCommunityError(error)
  }
}
