"use client"

import { signOut } from "next-auth/react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function LogoutMenuItem() {
  return (
    <DropdownMenuItem
      onClick={() => {
        void signOut({ redirectTo: "/login" })
      }}
    >
      로그아웃
    </DropdownMenuItem>
  )
}
