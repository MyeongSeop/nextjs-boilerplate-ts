import { beforeEach, describe, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  credentialsProvider: vi.fn((options) => ({ id: "credentials", options })),
  googleProvider: vi.fn((options) => ({ id: "google", options })),
  nextAuth: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock("next-auth", () => ({
  default: mocks.nextAuth,
}))

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({ name: "prisma-adapter" })),
}))

vi.mock("next-auth/providers/credentials", () => ({
  default: mocks.credentialsProvider,
}))

vi.mock("next-auth/providers/google", () => ({
  default: mocks.googleProvider,
}))

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("@/lib/validations/auth", () => ({
  loginSchema: {
    safeParse: vi.fn(),
  },
}))

import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validations/auth"

describe("Auth configuration", () => {
  type ProviderConfig = {
    providers: Array<{
      id: string
      options?: {
        authorize?: (credentials: {
          identifier: string
          password: string
        }) => Promise<unknown>
      }
    }>
  }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
  })

  test("omits Google provider when OAuth env vars are missing", async () => {
    await import("@/lib/auth")

    const calls = mocks.nextAuth.mock.calls as unknown as [ProviderConfig][]
    const config = calls[0]?.[0]
    expect(config).toBeDefined()
    expect(config?.providers).toHaveLength(1)
    expect(config?.providers[0]).toMatchObject({ id: "credentials" })
    expect(mocks.googleProvider).not.toHaveBeenCalled()
  })

  test("includes Google provider when OAuth env vars are set", async () => {
    process.env.GOOGLE_CLIENT_ID = "google-client-id"
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret"

    await import("@/lib/auth")

    const calls = mocks.nextAuth.mock.calls as unknown as [ProviderConfig][]
    const config = calls[0]?.[0]
    expect(config).toBeDefined()
    expect(config?.providers).toHaveLength(2)
    expect(config?.providers[0]).toMatchObject({ id: "google" })
    expect(config?.providers[1]).toMatchObject({ id: "credentials" })
    expect(mocks.googleProvider).toHaveBeenCalledWith({
      clientId: "google-client-id",
      clientSecret: "google-client-secret",
    })
  })

  test("authorizes the admin account by username when normalized identifier is admin", async () => {
    vi.mocked(loginSchema.safeParse).mockReturnValue({
      success: true,
      data: { identifier: "admin", password: "admin1" },
    } as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "admin-id",
      username: "admin",
      email: "admin@example.com",
      password: "hashed-password",
      role: "ADMIN",
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    await import("@/lib/auth")

    const calls = mocks.nextAuth.mock.calls as unknown as [ProviderConfig][]
    const config = calls.at(-1)?.[0]
    expect(config).toBeDefined()
    const provider = config?.providers.find((entry) => entry.id === "credentials")
    expect(provider).toBeDefined()
    const user = await provider?.options?.authorize?.({ identifier: " Admin ", password: "admin1" })

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { username: "admin" },
    })
    expect(db.user.findUnique).not.toHaveBeenCalledWith({
      where: { email: "admin" },
    })
    expect(user).toMatchObject({
      email: "admin@example.com",
      role: "ADMIN",
    })
  })
})
