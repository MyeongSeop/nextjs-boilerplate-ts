"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Button, buttonVariants } from "@/components/ui/button"

type CommunityActionResult = {
  error?: string
  success?: boolean
}

type PostActionsProps = {
  postId: string
  canEdit: boolean
  onDeletePost?: (formData: FormData) => Promise<CommunityActionResult | void>
  boardSlug?: string
}

export function PostActions({ postId, canEdit, onDeletePost, boardSlug }: PostActionsProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canEdit) return null

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!onDeletePost) return

    const formData = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    try {
      const result = await onDeletePost(formData)

      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }

      if (boardSlug) {
        router.push(`/boards/${boardSlug}`)
        return
      }

      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canEdit ? (
        <Link
          href={`/posts/${postId}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Edit
        </Link>
      ) : null}
      {onDeletePost ? (
        <form onSubmit={handleDelete} className="flex items-center gap-2">
          <input type="hidden" name="postId" value={postId} />
          <Button variant="destructive" size="sm" type="submit" disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </form>
      ) : null}
    </div>
  )
}
