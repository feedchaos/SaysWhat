import React from "react"
import type { RecordAggregate } from "../../types/search"

export type ProPanelTab = "occurrences" | "context" | "sourceInfo"

export type Occurrence = {
  anchorId: string
  occurrenceIndex: number
  locator: number | null
  unitIndex: number | null
  snippet: string
}

export type ContextAnchorRecord = {
  recordId: string
  kind: string
  textEn: string
}

export type ContextAnchor = {
  anchorId: string
  sourceId: string
  startChar: number | null
  endChar: number | null
  locator: number | null
  pos: number | null
  snippet: string
  records: ContextAnchorRecord[]
}

export interface DetailOverlayContextValue {
  tier: "free" | "pro"
  isPro: boolean
  record: RecordAggregate
  sourceOptions: string[]
  selectedSourceId: string | null
  setSelectedSourceId: (id: string | null) => void
  currentSource: any | null
  activeTab: ProPanelTab
  setActiveTab: (tab: ProPanelTab) => void
  occurrences: Occurrence[]
  selectedOccurrenceId: string | null
  setSelectedOccurrenceId: (id: string | null) => void
  contextAnchors: ContextAnchor[]
  focusAnchorId: string | null
  setFocusAnchorId: (anchorId: string | null) => void
  fetchAnchorId: string | null
  setFetchAnchorId: (anchorId: string | null) => void
  setFetchParams: (
    anchorId: string | null,
    direction?: "none" | "plus" | "minus"
  ) => void
  minPos: number | null
  maxPos: number | null
  setPosBounds: (minPos: number | null, maxPos: number | null) => void
  // centerOnNextFocusToken: number
  //requestCenterOnNextFocus: () => void
  sourceUrl: string | null
  showFullDescription: boolean
  setShowFullDescription: React.Dispatch<React.SetStateAction<boolean>>
  pendingCenterAnchorId: string | null
  setPendingCenterAnchorId: (anchorId: string | null) => void
  initialContextLoaded: boolean
}

export const DetailOverlayContext = React.createContext<
  DetailOverlayContextValue | undefined
>(undefined)

export const useDetailOverlay = () => {
  const ctx = React.useContext(DetailOverlayContext)
  if (!ctx)
    throw new Error(
      "useDetailOverlay must be used within DetailOverlayContext.Provider"
    )
  return ctx
}
