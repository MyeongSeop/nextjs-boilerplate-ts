import { z } from "zod"

const normalizeLoginIdentifier = (value: string) => value.trim().toLowerCase()

const loginIdentifierSchema = z
  .string()
  .min(1, "로그인 정보를 입력해 주세요.")
  .transform(normalizeLoginIdentifier)
  .refine((value) => value === "admin" || z.email().safeParse(value).success, {
    message: "관리자 아이디(admin) 또는 유효한 이메일을 입력해 주세요.",
  })

export const loginSchema = z.object({
  identifier: loginIdentifierSchema,
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
    email: z.string().email("유효한 이메일을 입력해주세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
