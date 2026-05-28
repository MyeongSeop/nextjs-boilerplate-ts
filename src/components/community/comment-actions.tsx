"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type CommunityActionResult = {
  error?: string
  success?: boolean
}

type DeleteCommentButtonProps = {
  commentId: string
  onDeleteComment: (formData: FormData) => Promise<CommunityActionResult | void>
}

export function DeleteCommentButton({
  commentId,
  onDeleteComment,
}: DeleteCommentButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    try {
      const result = await onDeleteComment(formData)

      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }

      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleDelete} className="flex items-center gap-2">
      <input type="hidden" name="commentId" value={commentId} />
      <Button variant="ghost" size="xs" type="submit" disabled={pending}>
        {pending ? "삭제 중..." : "삭제"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </form>
  )
}
