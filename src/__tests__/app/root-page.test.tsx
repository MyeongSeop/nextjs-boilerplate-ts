import { describe, expect, test, vi, beforeEach } from "vitest"

const { redirect, auth } = vi.hoisted(() => ({
  redirect: vi.fn(),
  auth: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect,
}))

vi.mock("@/lib/auth", () => ({
  auth,
}))

import RootPage from "@/app/page"

describe("root page redirects", () => {
  beforeEach(() => {
    redirect.mockReset()
    auth.mockReset()
  })

  test("redirects anonymous users to login", async () => {
    auth.mockResolvedValue(null)

    await RootPage()

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  test("redirects authenticated users to dashboard", async () => {
    auth.mockResolvedValue({
      user: { id: "user-1", email: "codex-test@example.com", role: "USER" },
    })

    await RootPage()

    expect(redirect).toHaveBeenCalledWith("/dashboard")
  })
})
