import { describe, expect, test, vi } from "vitest"

const { signOut } = vi.hoisted(() => ({
  signOut: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  signOut,
}))

import { GET } from "@/app/logout/route"

describe("logout route", () => {
  test("signs out on visit and redirects to login", async () => {
    await GET()

    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login" })
  })
})
