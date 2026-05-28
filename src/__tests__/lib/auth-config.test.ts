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

describe("Auth configuration", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
  })

  test("omits Google provider when OAuth env vars are missing", async () => {
    await import("@/lib/auth")

    const config = mocks.nextAuth.mock.calls[0][0]
    expect(config.providers).toHaveLength(1)
    expect(config.providers[0]).toMatchObject({ id: "credentials" })
    expect(mocks.googleProvider).not.toHaveBeenCalled()
  })

  test("includes Google provider when OAuth env vars are set", async () => {
    process.env.GOOGLE_CLIENT_ID = "google-client-id"
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret"

    await import("@/lib/auth")

    const config = mocks.nextAuth.mock.calls[0][0]
    expect(config.providers).toHaveLength(2)
    expect(config.providers[0]).toMatchObject({ id: "google" })
    expect(config.providers[1]).toMatchObject({ id: "credentials" })
    expect(mocks.googleProvider).toHaveBeenCalledWith({
      clientId: "google-client-id",
      clientSecret: "google-client-secret",
    })
  })
})
