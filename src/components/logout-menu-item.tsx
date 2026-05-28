import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function LogoutMenuItem() {
  return (
    <DropdownMenuItem>
      <Link href="/logout" className="block w-full">
        로그아웃
      </Link>
    </DropdownMenuItem>
  )
}
