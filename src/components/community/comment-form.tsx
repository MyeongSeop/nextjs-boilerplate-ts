"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CommunityActionResult = {
  error?: string
  success?: boolean
  commentId?: string
}

type CommentFormProps = {
  action: (formData: FormData) => Promise<CommunityActionResult | void>
  postId: string
}

export function CommentForm({ action, postId }: CommentFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      formRef.current?.reset()
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="postId" value={postId} />
          <div className="space-y-2">
            <Label htmlFor="content">Comment</Label>
            <Textarea
              id="content"
              name="content"
              rows={4}
              placeholder="Share your thoughts."
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Submitting..." : "Add comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
