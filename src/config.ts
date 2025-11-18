export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"

export const DEFAULT_SEARCH_LIMIT = 20

export const DEFAULT_KINDS = ["fact", "title", "concept", "person"] as const

export type SearchKind = (typeof DEFAULT_KINDS)[number]
