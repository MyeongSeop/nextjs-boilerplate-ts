import { describe, expect, test } from "vitest"
import { loginSchema, registerSchema } from "@/lib/validations/auth"

describe("loginSchema", () => {
  test("valid credentials pass", () => {
    const result = loginSchema.safeParse({
      identifier: "user@example.com",
      password: "password123",
    })
    expect(result.success).toBe(true)
  })

  test("invalid email fails", () => {
    const result = loginSchema.safeParse({
      identifier: "not-an-email",
      password: "password123",
    })
    expect(result.success).toBe(false)
  })

  test("empty password fails", () => {
    const result = loginSchema.safeParse({
      identifier: "user@example.com",
      password: "",
    })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  const valid = {
    name: "Alice",
    email: "alice@example.com",
    password: "securepassword",
    confirmPassword: "securepassword",
  }

  test("valid data passes", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  test("password mismatch fails", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain("confirmPassword")
  })

  test("password under 8 chars fails", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    })
    expect(result.success).toBe(false)
  })

  test("name under 2 chars fails", () => {
    const result = registerSchema.safeParse({ ...valid, name: "A" })
    expect(result.success).toBe(false)
  })
})
