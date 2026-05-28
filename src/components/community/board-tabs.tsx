import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  COMMUNITY_BOARD_META,
  COMMUNITY_BOARD_ORDER,
  type CommunityBoardSlug,
} from "./community-meta"

export function BoardTabs({ currentSlug }: { currentSlug: CommunityBoardSlug }) {
  return (
    <nav
      aria-label="커뮤니티 게시판"
      className="flex gap-2 overflow-x-auto border-b border-border pb-3"
    >
      {COMMUNITY_BOARD_ORDER.map((slug) => {
        const meta = COMMUNITY_BOARD_META[slug]
        const active = slug === currentSlug

        return (
          <Link
            key={slug}
            href={`/boards/${slug}`}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {meta.label}
          </Link>
        )
      })}
    </nav>
  )
}

