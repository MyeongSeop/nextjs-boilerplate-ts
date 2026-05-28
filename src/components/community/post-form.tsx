"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { COMMUNITY_BOARD_META, type CommunityBoardSlug } from "./community-meta"

type CommunityActionResult = {
  error?: string
  success?: boolean
  postId?: string
}

type PostFormProps = {
  action: (formData: FormData) => Promise<CommunityActionResult | void>
  boardSlug: CommunityBoardSlug
  mode: "create" | "edit"
  postId?: string
  initialTitle?: string
  initialContent?: string
  updatedAt?: string | Date | null
}

export function PostForm({
  action,
  boardSlug,
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
  updatedAt,
}: PostFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const board = COMMUNITY_BOARD_META[boardSlug]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    try {
      const result = await action(formData)

      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }

      if (mode === "create") {
        const nextPostId = result && "postId" in result ? result.postId : null
        if (nextPostId) {
          router.push(`/posts/${nextPostId}`)
          return
        }
      }

      if (mode === "edit" && postId) {
        router.push(`/posts/${postId}`)
      }

      router.refresh()
      formRef.current?.reset()
    } finally {
      setPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create post" : "Edit post"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="boardSlug" value={boardSlug} />
          {mode === "edit" && postId ? <input type="hidden" name="postId" value={postId} /> : null}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialTitle}
              placeholder={`${board.label} board title`}
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={initialContent}
              rows={12}
              placeholder="Write your post here."
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? `This post will be published to ${board.label}.`
                : `Last updated: ${updatedAt ? new Date(updatedAt).toLocaleString() : "-"}`}
            </p>
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
              {pending ? "Submitting..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
