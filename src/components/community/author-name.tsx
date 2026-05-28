import { getUserDisplayName } from "@/lib/community/display"

type AuthorLike = {
  id: string
  name?: string | null
  username?: string | null
}

export function AuthorName({ user }: { user?: AuthorLike | null }) {
  return <span>{getUserDisplayName(user)}</span>
}

