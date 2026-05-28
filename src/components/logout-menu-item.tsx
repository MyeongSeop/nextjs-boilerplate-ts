import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function LogoutMenuItem() {
  return (
    <DropdownMenuItem>
      <a href="/logout" className="block w-full">
        로그아웃
      </a>
    </DropdownMenuItem>
  )
}
