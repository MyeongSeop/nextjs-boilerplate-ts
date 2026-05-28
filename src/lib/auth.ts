import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Provider } from "next-auth/providers"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { db } from "./db"
import { loginSchema } from "./validations/auth"

const credentialsProvider = Credentials({
  async authorize(credentials) {
    const parsed = loginSchema.safeParse(credentials)
    if (!parsed.success) return null

    const identifier = parsed.data.identifier
    const where =
      identifier === "admin"
        ? { username: "admin" as const }
        : { email: identifier }

    const user = await db.user.findUnique({
      where,
    })
    if (!user || !user.password) return null

    const valid = await bcrypt.compare(parsed.data.password, user.password)
    if (!valid) return null

    const { password: _password, ...safeUser } = user
    void _password
    return safeUser
  },
})

function getAuthProviders() {
  const providers: Provider[] = [credentialsProvider]
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  if (googleClientId && googleClientSecret) {
    providers.unshift(
      Google({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      }),
    )
  }

  return providers
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: getAuthProviders(),
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (token) session.user.role = token.role as Role
      return session
    },
  },
})
