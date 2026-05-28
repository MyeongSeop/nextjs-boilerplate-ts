"use server"

import { db } from "@/lib/db"
import { loginSchema, registerSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function register(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "이미 사용 중인 이메일입니다." }
  }

  const hashed = await bcrypt.hash(password, 12)
  await db.user.create({ data: { name, email, password: hashed } })

  return { success: "계정이 생성되었습니다." }
}

export async function login(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "이메일 또는 비밀번호가 올바르지 않습니다." }
        default:
          return { error: "로그인 중 오류가 발생했습니다." }
      }
    }
    throw error // NEXT_REDIRECT must be re-thrown
  }
}
