import { Card, CardContent } from "@/components/ui/card"
import { AuthorName } from "./author-name"
import { formatCommunityDateTime } from "./community-date"
import { DeleteCommentButton } from "./comment-actions"

type CommentAuthor = {
  id: string
  name?: string | null
  username?: string | null
}

type CommunityComment = {
  id: string
  authorId?: string | null
  author?: CommentAuthor | null
  content: string
  createdAt: string | Date
}

type CommunityActionResult = {
  error?: string
  success?: boolean
}

type CommentListProps = {
  comments: CommunityComment[]
  currentUserId?: string | null
  isAdmin?: boolean
  onDeleteComment?: (formData: FormData) => Promise<CommunityActionResult | void>
}

function canManageComment(
  currentUserId: string | null | undefined,
  isAdmin: boolean | undefined,
  comment: CommunityComment,
) {
  if (!currentUserId || !comment.authorId) return false
  return Boolean(isAdmin) || currentUserId === comment.authorId
}

export function CommentList({
  comments,
  currentUserId,
  isAdmin,
  onDeleteComment,
}: CommentListProps) {
  if (!comments.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          아직 댓글이 없습니다.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Card key={comment.id} className="py-0">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    <AuthorName user={comment.author} />
                  </span>
                  <span>{formatCommunityDateTime(comment.createdAt)}</span>
                </div>
              </div>
              {onDeleteComment && canManageComment(currentUserId, isAdmin, comment) ? (
                <DeleteCommentButton commentId={comment.id} onDeleteComment={onDeleteComment} />
              ) : null}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-6 text-foreground">
              {comment.content}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
