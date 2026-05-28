import { auth } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutMenuItem } from "@/components/logout-menu-item"
import Link from "next/link"

export async function Navbar() {
  const session = await auth()
  const user = session?.user

  return (
    <nav className="border-b px-6 py-3 flex items-center justify-between bg-background">
      <Link href="/dashboard" className="font-semibold text-lg">
        MyApp
      </Link>
      <div className="flex items-center gap-4">
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
              <AvatarFallback>
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <LogoutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
