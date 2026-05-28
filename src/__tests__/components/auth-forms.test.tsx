import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

vi.mock("@/actions/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

describe("auth forms", () => {
  test("login form renders Korean labels", () => {
    render(<LoginForm />)

    expect(screen.getAllByText("로그인")).toHaveLength(2)
    expect(screen.getByLabelText("이메일")).toBeInTheDocument()
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Google로 계속하기" }),
    ).toBeInTheDocument()
    expect(screen.getByText("또는")).toBeInTheDocument()
    expect(screen.getByText("회원가입")).toBeInTheDocument()
  })

  test("register form renders Korean labels", () => {
    render(<RegisterForm />)

    expect(screen.getAllByText("회원가입")).toHaveLength(2)
    expect(screen.getByLabelText("이름")).toBeInTheDocument()
    expect(screen.getByLabelText("이메일")).toBeInTheDocument()
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument()
    expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "회원가입" })).toBeInTheDocument()
    expect(screen.getByText("로그인")).toBeInTheDocument()
  })
})
