import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { AuthorName } from "@/components/community/author-name"

describe("AuthorName", () => {
  test("uses name, then username, then id", () => {
    render(
      <div>
        <AuthorName user={{ id: "user-1", name: "이름", username: "name-1" }} />
        <AuthorName user={{ id: "user-2", name: null, username: "name-2" }} />
        <AuthorName user={{ id: "user-3", name: null, username: null }} />
      </div>,
    )

    expect(screen.getByText("이름")).toBeInTheDocument()
    expect(screen.getByText("name-2")).toBeInTheDocument()
    expect(screen.getByText("user-3")).toBeInTheDocument()
  })
})

