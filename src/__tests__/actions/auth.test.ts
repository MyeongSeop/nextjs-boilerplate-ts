import { beforeEach, describe, expect, test, vi } from "vitest"

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
import { login } from "@/actions/auth"
import { signIn } from "@/lib/auth"
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
    } as never)

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
    } as never)

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

describe("login()", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("passes identifier to signIn during login", async () => {
    const fd = new FormData()
    fd.append("identifier", "admin")
    fd.append("password", "admin1")

    await login(fd)

    expect(signIn).toHaveBeenCalledTimes(1)
    expect(vi.mocked(signIn).mock.calls[0][0]).toBe("credentials")
    expect(vi.mocked(signIn).mock.calls[0][1]).toEqual({
      identifier: "admin",
      password: "admin1",
      redirectTo: "/dashboard",
    })
    expect(vi.mocked(signIn).mock.calls[0][1]).not.toHaveProperty("email")
  })
})
