"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { register } from "@/actions/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "가입 중..." : "회원가입"}
    </Button>
  )
}

export function RegisterForm() {
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(undefined)
    setSuccess(undefined)
    const result = await register(formData)
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(result.success)
      setTimeout(() => router.push("/login"), 1500)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <SubmitButton />
        </form>
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary underline">
            로그인
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
