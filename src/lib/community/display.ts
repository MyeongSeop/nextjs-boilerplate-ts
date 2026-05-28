type DisplayableUser = {
  id: string
  name?: string | null
  username?: string | null
}

export function getUserDisplayName(user: DisplayableUser | null | undefined) {
  if (!user) return "알 수 없음"

  const name = user.name?.trim()
  if (name) return name

  const username = user.username?.trim()
  if (username) return username

  return user.id
}
