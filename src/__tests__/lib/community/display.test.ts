import { describe, expect, test } from "vitest"
import { getUserDisplayName } from "@/lib/community/display"

describe("community display", () => {
  test("falls back from name to username to id", () => {
    expect(
      getUserDisplayName({
        id: "u1",
        name: "홍길동",
        username: "admin",
      }),
    ).toBe("홍길동")

    expect(
      getUserDisplayName({
        id: "u2",
        name: null,
        username: "admin",
      }),
    ).toBe("admin")

    expect(
      getUserDisplayName({
        id: "u3",
        name: null,
        username: null,
      }),
    ).toBe("u3")
  })
})
