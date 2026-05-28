import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register")
  const isAdminPage = nextUrl.pathname.startsWith("/admin")
  const isProtectedPage =
    nextUrl.pathname.startsWith("/dashboard") || isAdminPage

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }
  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
  if (isAdminPage && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
