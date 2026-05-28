export type CommunitySessionLike = {
  user?: {
    id?: string
    role?: string
  }
}

export function getSessionUserId(session: CommunitySessionLike | null | undefined) {
  return session?.user?.id
}

export function canEditCommunityPost(
  session: CommunitySessionLike | null | undefined,
  authorId?: string | null,
) {
  const user = session?.user
  if (!user?.id || !authorId) return false
  return user.role === "ADMIN" || user.id === authorId
}
