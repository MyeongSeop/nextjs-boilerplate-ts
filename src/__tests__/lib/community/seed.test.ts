import { beforeEach, describe, expect, test, vi } from "vitest"
import { Role } from "@prisma/client"

vi.mock("@/lib/db", () => ({
  db: {
    board: {
      upsert: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}))

import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { seedBoards, seedDefaultAdmin } from "@/lib/community/seed"

describe("community seed", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("upserts the four default boards", async () => {
    await seedBoards()

    expect(db.board.upsert).toHaveBeenCalledTimes(4)
    expect(db.board.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "notice" },
      }),
    )
  })

  test("creates the default admin only when missing", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(null as never)

    await seedDefaultAdmin()

    expect(db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "admin",
          email: "admin@example.com",
          role: Role.ADMIN,
        }),
      }),
    )
    expect(bcrypt.hash).toHaveBeenCalledWith("admin1", 12)
  })
})
