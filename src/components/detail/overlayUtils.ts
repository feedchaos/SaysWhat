import type { RecordAggregate } from "../../types/search"
import type { Occurrence } from "./DetailOverlayContext"

export const formatLocator = (locator: number | null) => {
  if (locator === null || locator === undefined) return "—"
  const totalSeconds = Math.floor(locator / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export const getBaseSourceUrl = (sourceId: string, source: any) =>
  source?.url || `https://www.youtube.com/watch?v=${sourceId}`

export const buildLocatorUrl = (
  baseUrl: string | null,
  locator?: number | null
): string | null => {
  if (!baseUrl) return null
  if (locator === null || locator === undefined) return baseUrl
  const seconds = Math.floor(locator / 1000)
  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${seconds}`
}

export const buildOccurrences = (
  record: RecordAggregate | null,
  sourceId: string | null
): Occurrence[] => {
  if (
    !record ||
    !sourceId ||
    !record.sources?.[sourceId] ||
    !record.sources?.[sourceId].anchors
  )
    return []
  const source = record.sources[sourceId]
  const declaredOccurrences = Array.isArray(source.anchors)
    ? source.anchors
    : null

  if (declaredOccurrences?.length) {
    return declaredOccurrences.map(
      (occ: Record<string, string | number>, idx: number) => ({
        anchorId:
          typeof occ.anchorId === "number"
            ? String(occ.anchorId)
            : (occ.anchorId as string),
        occurrenceIndex: occ.occurrenceIndex || idx + 1,
        locator:
          typeof occ.locator === "number"
            ? occ.locator
            : typeof occ.locator_ms === "number"
            ? occ.locator_ms
            : null,
        unitIndex: typeof occ.anchorId === "string" ? occ.anchorId : null,
      })
    )
  }
  return []
}
