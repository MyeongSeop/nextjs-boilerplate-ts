import type { Session } from "next-auth"
import { Role } from "@prisma/client"
import { db } from "@/lib/db"
import {
  createCommentSchema,
  updateCommentSchema,
} from "@/lib/validations/community"
import { type CommunitySession } from "./boards"

type ManagedComment = {
  id: string
  postId: string
  authorId: string
  content: string
}

export async function getCommunityCommentsByPostId(postId: string) {
  return db.comment.findMany({
    where: {
      postId,
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })
}

export const getCommentsByPostId = getCommunityCommentsByPostId

export async function getCommentById(commentId: string) {
  return db.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      author: true,
      post: true,
    },
  })
}

export async function assertCanWriteComment(session: CommunitySession) {
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.")
  }
}

export function assertCanManageComment(
  session: Session | CommunitySession,
  comment: ManagedComment,
) {
  const user = session?.user
  if (!user?.id) {
    throw new Error("로그인이 필요합니다.")
  }

  if (user.role === Role.ADMIN) {
    return
  }

  if (user.id !== comment.authorId) {
    throw new Error("권한이 없습니다.")
  }
}

export async function createCommentRecord(data: {
  postId: string
  authorId: string
  content: string
}) {
  return db.comment.create({
    data,
  })
}

export async function updateCommentRecord(data: {
  commentId: string
  content: string
}) {
  return db.comment.update({
    where: {
      id: data.commentId,
    },
    data: {
      content: data.content,
    },
  })
}

export async function deleteCommentRecord(commentId: string) {
  return db.comment.delete({
    where: {
      id: commentId,
    },
  })
}

export function parseCreateCommentInput(formData: FormData) {
  return createCommentSchema.safeParse(Object.fromEntries(formData))
}

export function parseUpdateCommentInput(formData: FormData) {
  return updateCommentSchema.safeParse(Object.fromEntries(formData))
}
