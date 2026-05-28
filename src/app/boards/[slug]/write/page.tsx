import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { canRenderWriteButton, getBoardBySlug } from "@/lib/community/boards"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BoardTabs } from "@/components/community/board-tabs"
import { PostForm } from "@/components/community/post-form"
import {
  COMMUNITY_BOARD_META,
  type CommunityBoardSlug,
} from "@/components/community/community-meta"
import { createPost } from "@/actions/community"

export default async function WritePostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [session, board] = await Promise.all([auth(), getBoardBySlug(slug)])

  if (!board) notFound()

  const boardSlug = board.slug as CommunityBoardSlug
  const allowed = canRenderWriteButton(session, boardSlug)
  const meta = COMMUNITY_BOARD_META[boardSlug]

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="space-y-6">
        <BoardTabs currentSlug={boardSlug} />

        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">{meta.label}</p>
          <h1 className="text-2xl font-semibold tracking-tight">글쓰기</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {board.description ?? meta.description}
          </p>
        </section>

        {allowed ? (
          <PostForm action={createPost} boardSlug={boardSlug} mode="create" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>글쓰기를 사용할 수 없습니다.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                이 게시판은 로그인한 사용자만 글을 쓸 수 있습니다.
                {boardSlug === "notice" ? " 공지는 관리자만 등록할 수 있습니다." : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/login" className={buttonVariants({ size: "sm" })}>
                  로그인
                </Link>
                <Link
                  href={`/boards/${boardSlug}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  목록으로
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

