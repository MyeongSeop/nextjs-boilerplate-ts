import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getPostForEdit } from "@/lib/community/posts"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostForm } from "@/components/community/post-form"
import {
  canEditCommunityPost,
  getSessionUserId,
} from "@/components/community/permissions"
import { type CommunityBoardSlug } from "@/components/community/community-meta"
import { updatePost } from "@/actions/community"

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, post] = await Promise.all([auth(), getPostForEdit(id)])

  if (!post) notFound()

  const canEdit = canEditCommunityPost(session, post.authorId)
  const currentUserId = getSessionUserId(session)

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">{post.board.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight">글 수정</h1>
        </section>

        {canEdit ? (
          <PostForm
            action={updatePost}
            boardSlug={post.board.slug as CommunityBoardSlug}
            mode="edit"
            postId={post.id}
            initialTitle={post.title}
            initialContent={post.content}
            updatedAt={post.updatedAt}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>수정 권한이 없습니다.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {currentUserId
                  ? "이 글은 작성자 또는 관리자만 수정할 수 있습니다."
                  : "로그인 후 다시 시도해 주세요."}
              </p>
              <Link
                href={`/posts/${post.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                글로 돌아가기
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
