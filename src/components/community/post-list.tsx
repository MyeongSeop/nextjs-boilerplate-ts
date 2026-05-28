import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  COMMUNITY_BOARD_META,
  type CommunityBoardSlug,
} from "./community-meta"
import { AuthorName } from "./author-name"
import { formatCommunityDate } from "./community-date"

type CommunityAuthor = {
  id: string
  name?: string | null
  username?: string | null
}

type CommunityPost = {
  id: string
  board?: {
    slug?: string
    name?: string | null
  }
  title: string
  author?: CommunityAuthor | null
  createdAt: string | Date
  commentCount?: number
  _count?: {
    comments?: number
  }
}

function getCommentCount(post: CommunityPost) {
  return post.commentCount ?? post._count?.comments ?? 0
}

function getBoardSlug(post: CommunityPost) {
  return post.board?.slug ?? "free"
}

export function PostList({ posts }: { posts: CommunityPost[] }) {
  if (!posts.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          아직 게시글이 없습니다.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const boardSlug = getBoardSlug(post) as CommunityBoardSlug
        const board = COMMUNITY_BOARD_META[boardSlug] ?? {
          label: post.board?.name ?? boardSlug,
        }

        return (
          <Card key={post.id} className="py-0">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-0.5 text-foreground">
                      {board.label}
                    </span>
                    <span>
                      <AuthorName user={post.author} />
                    </span>
                    <span>{formatCommunityDate(post.createdAt)}</span>
                  </div>
                  <Link
                    href={`/posts/${post.id}`}
                    className="line-clamp-2 block text-sm font-medium leading-6 hover:underline"
                  >
                    {post.title}
                  </Link>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground">
                  댓글 {getCommentCount(post)}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
