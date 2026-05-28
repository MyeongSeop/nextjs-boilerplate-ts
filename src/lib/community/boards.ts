import { Role } from "@prisma/client"
import { db } from "@/lib/db"

export const COMMUNITY_BOARD_SLUGS = ["notice", "free", "qna", "attendance"] as const

export type CommunityBoardSlug = (typeof COMMUNITY_BOARD_SLUGS)[number]

export type CommunitySession = {
  user?: {
    id?: string | null
    role?: Role | null
  } | null
} | null

type AuthenticatedCommunityUser = {
  id: string
  role?: Role | null
}

function requireAuthenticatedUser(session: CommunitySession): AuthenticatedCommunityUser {
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.")
  }

  return {
    id: session.user.id,
    role: session.user.role,
  }
}

export async function getCommunityBoards() {
  return db.board.findMany({
    orderBy: {
      createdAt: "asc",
    },
  })
}

export async function getCommunityBoardBySlug(slug: CommunityBoardSlug) {
  return db.board.findUnique({
    where: {
      slug,
    },
  })
}

export async function getBoardBySlug(slug: string) {
  if (!COMMUNITY_BOARD_SLUGS.includes(slug as CommunityBoardSlug)) return null

  return getCommunityBoardBySlug(slug as CommunityBoardSlug)
}

export function assertCanCreatePostInBoard(
  session: CommunitySession,
  boardSlug: CommunityBoardSlug,
) {
  const user = requireAuthenticatedUser(session)

  if (boardSlug === "notice" && user.role !== Role.ADMIN) {
    throw new Error("공지사항은 관리자만 글을 작성할 수 있습니다.")
  }
}

export async function getBoardWithPosts(slug: string) {
  if (!COMMUNITY_BOARD_SLUGS.includes(slug as CommunityBoardSlug)) return null

  return db.board.findUnique({
    where: {
      slug: slug as CommunityBoardSlug,
    },
    include: {
      posts: {
        include: {
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
      },
    },
  })
}

export function canRenderWriteButton(
  session: CommunitySession,
  boardSlug: string,
) {
  if (!session?.user?.id) return false

  if (boardSlug === "notice") {
    return session.user.role === Role.ADMIN
  }

  return true
}
