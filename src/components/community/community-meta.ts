export const COMMUNITY_BOARD_META = {
  notice: {
    label: "공지",
    description: "관리자가 공지와 안내를 올리는 게시판입니다.",
  },
  free: {
    label: "자유",
    description: "자유롭게 이야기와 근황을 나누는 게시판입니다.",
  },
  qna: {
    label: "질문",
    description: "궁금한 점을 묻고 답을 찾는 게시판입니다.",
  },
  attendance: {
    label: "출석",
    description: "가볍게 출석을 남기는 게시판입니다.",
  },
} as const

export const COMMUNITY_BOARD_ORDER = ["notice", "free", "qna", "attendance"] as const

export type CommunityBoardSlug = (typeof COMMUNITY_BOARD_ORDER)[number]

export function getCommunityBoardLabel(slug: string) {
  return slug in COMMUNITY_BOARD_META
    ? COMMUNITY_BOARD_META[slug as CommunityBoardSlug].label
    : slug
}

export function getCommunityBoardDescription(slug: string) {
  return slug in COMMUNITY_BOARD_META
    ? COMMUNITY_BOARD_META[slug as CommunityBoardSlug].description
    : ""
}

