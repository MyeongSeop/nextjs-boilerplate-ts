import { describe, test, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  signIn: vi.fn(),
}))

vi.mock("next-auth", () => ({
  default: vi.fn(),
  AuthError: class AuthError extends Error {
    type: string
    constructor(message?: string) {
      super(message)
      this.type = ""
    }
  },
}))

import { register } from "@/actions/auth"
import { db } from "@/lib/db"

describe("register()", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("returns error for invalid input", async () => {
    const fd = new FormData()
    fd.append("name", "A")
    fd.append("email", "not-email")
    fd.append("password", "short")
    fd.append("confirmPassword", "short")

    const result = await register(fd)
    expect(result.error).toBeDefined()
  })

  test("returns error if email already exists", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "1",
      email: "existing@example.com",
    } as any)

    const fd = new FormData()
    fd.append("name", "Alice")
    fd.append("email", "existing@example.com")
    fd.append("password", "password123")
    fd.append("confirmPassword", "password123")

    const result = await register(fd)
    expect(result.error).toBe("이미 사용 중인 이메일입니다.")
  })

  test("creates user and returns success for valid new email", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.user.create).mockResolvedValue({
      id: "2",
      email: "new@example.com",
    } as any)

    const fd = new FormData()
    fd.append("name", "Alice")
    fd.append("email", "new@example.com")
    fd.append("password", "password123")
    fd.append("confirmPassword", "password123")

    const result = await register(fd)
    expect(result.success).toBe("계정이 생성되었습니다.")
    expect(db.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Alice",
        email: "new@example.com",
        password: "hashed_password",
      }),
    })
  })
})
