import type { Session } from "next-auth"
import { Role } from "@prisma/client"
import { db } from "@/lib/db"
import {
  createPostSchema,
  updatePostSchema,
  type BoardSlug,
} from "@/lib/validations/community"
import { assertCanCreatePostInBoard, type CommunitySession } from "./boards"
import { getUserDisplayName } from "./display"
export { getBoardWithPosts } from "./boards"

export type CommunityAuthor = {
  id: string
  name?: string | null
  username?: string | null
}

type ManagedPost = {
  id: string
  boardId: string
  authorId: string
  title: string
  content: string
}

export function getCommunityAuthorDisplayName(author: CommunityAuthor | null | undefined) {
  return getUserDisplayName(author)
}

export const getAuthorDisplayName = getCommunityAuthorDisplayName

export async function getCommunityPostsByBoardSlug(boardSlug: BoardSlug) {
  return db.post.findMany({
    where: {
      board: {
        slug: boardSlug,
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
}

export async function getCommunityPostById(id: string) {
  return db.post.findUnique({
    where: {
      id,
    },
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
}

export const getPostById = getCommunityPostById

export async function getRecentPosts(limit = 8) {
  return db.post.findMany({
    take: limit,
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
}

export async function getPostForEdit(id: string) {
  return db.post.findUnique({
    where: { id },
    include: {
      board: true,
    },
  })
}

export function assertCanCreatePost(session: CommunitySession, boardSlug: BoardSlug) {
  assertCanCreatePostInBoard(session, boardSlug)
}

export function assertCanManagePost(session: Session | null, post: ManagedPost) {
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.")
  }

  if (session.user.role === Role.ADMIN) {
    return
  }

  if (session.user.id !== post.authorId) {
    throw new Error("권한이 없습니다.")
  }
}

export async function createPostRecord(data: {
  boardId: string
  authorId: string
  title: string
  content: string
}) {
  return db.post.create({
    data,
  })
}

export async function updatePostRecord(data: {
  postId: string
  title: string
  content: string
}) {
  return db.post.update({
    where: {
      id: data.postId,
    },
    data: {
      title: data.title,
      content: data.content,
    },
  })
}

export async function deletePostRecord(postId: string) {
  return db.post.delete({
    where: {
      id: postId,
    },
  })
}

export function parseCreatePostInput(formData: FormData) {
  return createPostSchema.safeParse(Object.fromEntries(formData))
}

export function parseUpdatePostInput(formData: FormData) {
  return updatePostSchema.safeParse(Object.fromEntries(formData))
}
