import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

const { signOut } = vi.hoisted(() => ({
  signOut: vi.fn(),
}))

vi.mock("next-auth/react", () => ({
  signOut,
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => <button onClick={onClick}>{children}</button>,
}))

import { LogoutMenuItem } from "@/components/logout-menu-item"

describe("logout menu item", () => {
  test("clicking logout signs the user out and redirects to login", () => {
    render(<LogoutMenuItem />)

    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }))

    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login" })
  })
})
