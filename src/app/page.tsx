import Link from "next/link"
import { auth } from "@/lib/auth"
import { getRecentPosts } from "@/lib/community/posts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { PostList } from "@/components/community/post-list"
import {
  COMMUNITY_BOARD_META,
  COMMUNITY_BOARD_ORDER,
} from "@/components/community/community-meta"

export default async function HomePage() {
  const [session, recentPosts] = await Promise.all([auth(), getRecentPosts(8)])
  const user = session?.user

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-4 rounded-3xl border bg-gradient-to-br from-background to-muted/50 p-8">
          <p className="text-sm font-medium text-muted-foreground">Community</p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              공지, 자유, 질문, 출석을 한 곳에서
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              공개 게시판은 누구나 읽을 수 있고, 로그인하면 글쓰기와 댓글 작성이 가능합니다.
              관리자는 공지 게시판을 사용할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/boards/free"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              자유 게시판 보기
            </Link>
            <Link
              href={user ? "/dashboard" : "/login"}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {user ? "대시보드" : "로그인"}
            </Link>
          </div>
          {user ? (
            <p className="text-sm text-muted-foreground">
              현재 로그인: <span className="font-medium text-foreground">{user.name ?? user.email}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              글을 쓰려면{" "}
              <Link href="/login" className="underline">
                로그인
              </Link>
              하세요.
            </p>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">게시판 바로가기</h2>
              <p className="text-sm text-muted-foreground">자주 쓰는 게시판으로 바로 이동하세요.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {COMMUNITY_BOARD_ORDER.map((slug) => {
              const board = COMMUNITY_BOARD_META[slug]

              return (
                <Link key={slug} href={`/boards/${slug}`}>
                  <Card className="h-full transition-colors hover:bg-muted/40">
                    <CardHeader className="space-y-2">
                      <CardTitle>{board.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {board.description}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {user ? null : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">로그인하면 글쓰기와 댓글 작성이 가능합니다.</p>
                <p className="text-sm text-muted-foreground">
                  게시판은 공개되어 있고, 작성은 로그인 후 이용할 수 있습니다.
                </p>
              </div>
              <Link href="/login" className={buttonVariants({ size: "sm" })}>
                로그인하기
              </Link>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">최근 게시글</h2>
            <p className="text-sm text-muted-foreground">
              전체 게시판의 최신 글을 모아 보여줍니다.
            </p>
          </div>
          <PostList posts={recentPosts} />
        </section>
      </div>
    </main>
  )
}

