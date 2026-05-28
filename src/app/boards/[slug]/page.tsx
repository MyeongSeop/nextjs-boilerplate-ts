import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { canRenderWriteButton } from "@/lib/community/boards"
import { getBoardWithPosts } from "@/lib/community/posts"
import { buttonVariants } from "@/components/ui/button"
import { BoardTabs } from "@/components/community/board-tabs"
import { PostList } from "@/components/community/post-list"
import {
  COMMUNITY_BOARD_META,
  type CommunityBoardSlug,
} from "@/components/community/community-meta"

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [session, board] = await Promise.all([auth(), getBoardWithPosts(slug)])

  if (!board) notFound()

  const boardSlug = board.slug as CommunityBoardSlug
  const writeAllowed = canRenderWriteButton(session, boardSlug)
  const meta = COMMUNITY_BOARD_META[boardSlug]

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="space-y-6">
        <BoardTabs currentSlug={boardSlug} />

        <section className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{meta.label}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{board.name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {board.description ?? meta.description}
            </p>
          </div>
          {writeAllowed ? (
            <Link
              href={`/boards/${board.slug}/write`}
              className={buttonVariants({ size: "sm" })}
            >
              글쓰기
            </Link>
          ) : null}
        </section>

        <PostList posts={board.posts} />
      </div>
    </main>
  )
}

