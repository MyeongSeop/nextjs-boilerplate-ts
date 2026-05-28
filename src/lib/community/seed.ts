import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { COMMUNITY_BOARD_META, COMMUNITY_BOARD_ORDER } from "@/components/community/community-meta"
import type { CommunityBoardSlug } from "@/components/community/community-meta"

export const COMMUNITY_BOARD_SEEDS: ReadonlyArray<{
  slug: CommunityBoardSlug
  name: string
  description: string
}> = COMMUNITY_BOARD_ORDER.map((slug) => ({
  slug,
  name: COMMUNITY_BOARD_META[slug].label,
  description: COMMUNITY_BOARD_META[slug].description,
}))

export async function seedBoards() {
  for (const board of COMMUNITY_BOARD_SEEDS) {
    await db.board.upsert({
      where: {
        slug: board.slug,
      },
      update: {
        name: board.name,
        description: board.description,
      },
      create: {
        slug: board.slug,
        name: board.name,
        description: board.description,
      },
    })
  }
}

export async function seedDefaultAdmin() {
  const existing = await db.user.findFirst({
    where: {
      OR: [{ username: "admin" }, { email: "admin@example.com" }],
    },
  })

  if (existing) {
    return existing
  }

  const password = await bcrypt.hash("admin1", 12)

  return db.user.create({
    data: {
      username: "admin",
      name: "admin",
      email: "admin@example.com",
      password,
      role: Role.ADMIN,
    },
  })
}

export const seedAdminUser = seedDefaultAdmin

export async function seedCommunity() {
  await seedBoards()
  await seedDefaultAdmin()
}
