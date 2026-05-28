import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getPostById } from "@/lib/community/posts"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CommentForm } from "@/components/community/comment-form"
import { CommentList } from "@/components/community/comment-list"
import { PostActions } from "@/components/community/post-actions"
import { AuthorName } from "@/components/community/author-name"
import {
  COMMUNITY_BOARD_META,
  getCommunityBoardLabel,
} from "@/components/community/community-meta"
import { formatCommunityDateTime } from "@/components/community/community-date"
import {
  canEditCommunityPost,
  getSessionUserId,
} from "@/components/community/permissions"
import { createComment, deleteComment, deletePost } from "@/actions/community"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, post] = await Promise.all([auth(), getPostById(id)])

  if (!post) notFound()

  const boardLabel =
    COMMUNITY_BOARD_META[post.board.slug as keyof typeof COMMUNITY_BOARD_META]?.label ??
    getCommunityBoardLabel(post.board.slug)
  const canEdit = canEditCommunityPost(session, post.authorId)
  const currentUserId = getSessionUserId(session)

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="space-y-8">
        <article className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link
                href={`/boards/${post.board.slug}`}
                className={buttonVariants({ variant: "outline", size: "xs" })}
              >
                {boardLabel}
              </Link>
              <span>
                작성자 <AuthorName user={post.author} />
              </span>
              <span>{formatCommunityDateTime(post.createdAt)}</span>
              {post.updatedAt ? (
                <span>수정 {formatCommunityDateTime(post.updatedAt)}</span>
              ) : null}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
          </div>

          <Card>
            <CardContent className="whitespace-pre-wrap py-6 text-sm leading-7">
              {post.content}
            </CardContent>
          </Card>

          <PostActions
            postId={post.id}
            canEdit={canEdit}
            onDeletePost={deletePost}
            boardSlug={post.board.slug}
          />
        </article>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">댓글</h2>
            <p className="text-sm text-muted-foreground">
              댓글은 로그인한 사용자만 작성할 수 있습니다.
            </p>
          </div>

          <CommentList
            comments={post.comments}
            currentUserId={currentUserId}
            isAdmin={session?.user?.role === "ADMIN"}
            onDeleteComment={deleteComment}
          />

          {currentUserId ? (
            <CommentForm action={createComment} postId={post.id} />
          ) : (
            <Card>
              <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  로그인하면 댓글을 남길 수 있습니다.
                </p>
                <Link href="/login" className={buttonVariants({ size: "sm" })}>
                  로그인
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  )
}
