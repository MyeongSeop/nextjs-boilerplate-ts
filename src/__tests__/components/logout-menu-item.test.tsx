import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

import { LogoutMenuItem } from "@/components/logout-menu-item"

describe("logout menu item", () => {
  test("renders a logout link to the server logout route", () => {
    render(<LogoutMenuItem />)

    expect(screen.getByRole("link", { name: "로그아웃" })).toHaveAttribute(
      "href",
      "/logout",
    )
  })
})
