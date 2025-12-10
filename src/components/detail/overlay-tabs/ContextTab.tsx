import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { useDetailOverlay } from "../DetailOverlayContext"
import { buildLocatorUrl } from "../overlayUtils"
import { openSearchBranch } from "../../../utils/searchNavigation"
import { PREFETCH_DISTANCE } from "./contextConfig"

const ContextTab: React.FC = () => {
  const {
    contextAnchors,
    focusAnchorId,
    setFetchParams,
    setFocusAnchorId,
    minPos,
    maxPos,
    pendingCenterAnchorId,
    setPendingCenterAnchorId,
    initialContextLoaded,
    sourceUrl,
    occurrences,
    selectedOccurrenceId,
    activeTab,
  } = useDetailOverlay()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const lastPrefetchRef = useRef<string | null>(null)
  const scrollLogicTimeoutRef = useRef<number | null>(null)
  const prevMinPosRef = useRef<number | null>(null)
  const prevScrollHeightRef = useRef<number | null>(null)

  // Selected occurrence (for fallback locator)
  const selectedOccurrence = useMemo(
    () => occurrences.find((occ) => occ.anchorId === selectedOccurrenceId),
    [occurrences, selectedOccurrenceId]
  )

  // Reset prefetch guard when context is cleared
  useEffect(() => {
    if (!contextAnchors.length) {
      lastPrefetchRef.current = null
    }
  }, [contextAnchors.length])

  // When new anchors are prepended (minPos decreases), keep viewport stable
  useEffect(() => {
    const container = containerRef.current
    const newMin = minPos

    if (!container) {
      prevMinPosRef.current = newMin
      prevScrollHeightRef.current = null
      return
    }

    const prevMin = prevMinPosRef.current
    const prevScrollHeight = prevScrollHeightRef.current
    const newScrollHeight = container.scrollHeight

    // We consider it an "upward extension" if:
    // - we previously had a minPos,
    // - new minPos is smaller (earlier) than previous,
    // - and we know the old scrollHeight.
    if (
      prevMin != null &&
      newMin != null &&
      prevScrollHeight != null &&
      newMin < prevMin &&
      contextAnchors.length > 0
    ) {
      const delta = newScrollHeight - prevScrollHeight
      if (delta > 0) {
        // Push the viewport down by the height of the newly added content,
        // so the previously visible anchors stay in place.
        container.scrollTop += delta
      }
    }

    prevMinPosRef.current = newMin
    prevScrollHeightRef.current = newScrollHeight
  }, [contextAnchors.length, minPos])

  // Center once when there's a pending anchor to center on
  useEffect(() => {
    if (!pendingCenterAnchorId) return
    if (!initialContextLoaded) return
    if (activeTab !== "context") return

    const container = containerRef.current
    if (!container) return

    const el = itemRefs.current.get(pendingCenterAnchorId)
    if (!el) return

    // Clear so we don't re-center on every minor change
    setPendingCenterAnchorId(null)

    window.requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const offset =
        elRect.top -
        containerRect.top -
        containerRect.height / 2 +
        elRect.height / 2

      container.scrollTo({
        top: container.scrollTop + offset,
        behavior: "smooth",
      })
    })
  }, [
    pendingCenterAnchorId,
    initialContextLoaded,
    activeTab,
    contextAnchors.length,
    setPendingCenterAnchorId,
  ])

  const runScrollLogic = useCallback(() => {
    // clear the timeout ref when we actually run
    scrollLogicTimeoutRef.current = null

    if (!initialContextLoaded) return

    const container = containerRef.current
    if (!container || !contextAnchors.length) return

    const containerRect = container.getBoundingClientRect()
    const centerY = containerRect.top + containerRect.height / 2

    // 1) Follow-mode: pick anchor whose center is closest to container center
    let bestAnchorId: string | null = null
    let bestDistance = Infinity

    for (const [anchorId, el] of itemRefs.current.entries()) {
      const rect = el.getBoundingClientRect()
      const elCenter = rect.top + rect.height / 2
      const distance = Math.abs(elCenter - centerY)
      if (distance < bestDistance) {
        bestDistance = distance
        bestAnchorId = anchorId
      }
    }

    const maxDelta = containerRect.height * 0.4

    // NEW: don't let focus jump too far in one go (smoothes backward prefetch)
    const MAX_FOCUS_JUMP = 2

    if (bestAnchorId && focusAnchorId) {
      const currentFocus = contextAnchors.find(
        (a) => a.anchorId === focusAnchorId
      )
      const bestAnchor = contextAnchors.find((a) => a.anchorId === bestAnchorId)
      if (
        currentFocus?.pos != null &&
        bestAnchor?.pos != null &&
        Math.abs(bestAnchor.pos - currentFocus.pos) > MAX_FOCUS_JUMP
      ) {
        // Candidate is way too far from current focus (likely just-prepended block),
        // so ignore it for this cycle.
        bestAnchorId = null
      }
    }

    if (
      bestAnchorId &&
      bestAnchorId !== focusAnchorId &&
      bestDistance <= maxDelta
    ) {
      setFocusAnchorId(bestAnchorId)
    }

    // 2) Prefetch logic

    const focusAnchor =
      contextAnchors.find(
        (a) => a.anchorId === (bestAnchorId ?? focusAnchorId)
      ) ??
      contextAnchors.find((a) => a.anchorId === focusAnchorId) ??
      contextAnchors[0]

    const currentPos = focusAnchor?.pos ?? null
    if (
      currentPos === null ||
      minPos === null ||
      maxPos === null ||
      minPos === maxPos
    ) {
      return
    }

    const minAnchor = contextAnchors.reduce<
      (typeof contextAnchors)[number] | null
    >(
      (acc, a) =>
        acc === null ||
        (a.pos ?? Number.POSITIVE_INFINITY) <
          (acc.pos ?? Number.POSITIVE_INFINITY)
          ? a
          : acc,
      null
    )

    const maxAnchor = contextAnchors.reduce<
      (typeof contextAnchors)[number] | null
    >(
      (acc, a) =>
        acc === null ||
        (a.pos ?? Number.NEGATIVE_INFINITY) >
          (acc.pos ?? Number.NEGATIVE_INFINITY)
          ? a
          : acc,
      null
    )

    const nearTop = container.scrollTop < 40
    const nearBottom =
      container.scrollHeight - (container.scrollTop + container.clientHeight) <
      40

    if (
      nearTop &&
      minAnchor &&
      currentPos - (minPos ?? currentPos) <= PREFETCH_DISTANCE
    ) {
      const key = `minus:${minAnchor.anchorId}`
      if (lastPrefetchRef.current !== key) {
        lastPrefetchRef.current = key
        setFetchParams(minAnchor.anchorId, "minus")
      }
    }

    if (
      nearBottom &&
      maxAnchor &&
      (maxPos ?? currentPos) - currentPos <= PREFETCH_DISTANCE
    ) {
      const key = `plus:${maxAnchor.anchorId}`
      if (lastPrefetchRef.current !== key) {
        lastPrefetchRef.current = key
        setFetchParams(maxAnchor.anchorId, "plus")
      }
    }
  }, [
    contextAnchors,
    focusAnchorId,
    minPos,
    maxPos,
    initialContextLoaded,
    setFetchParams,
    setFocusAnchorId,
  ])

  const handleScroll = useCallback(() => {
    if (!initialContextLoaded) return

    // Clear any pending run
    if (scrollLogicTimeoutRef.current !== null) {
      window.clearTimeout(scrollLogicTimeoutRef.current)
    }

    // Schedule logic after scroll settles (30 ms after last event – tweak as you like)
    scrollLogicTimeoutRef.current = window.setTimeout(() => {
      runScrollLogic()
    }, 30)
  }, [initialContextLoaded, runScrollLogic])

  useEffect(() => {
    return () => {
      if (scrollLogicTimeoutRef.current !== null) {
        window.clearTimeout(scrollLogicTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingRight: 6,
      }}
    >
      <div
        style={{
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {contextAnchors.map((anchor) => {
          const titleRecords = anchor.records.filter((r) => r.kind === "title")
          const factRecords = anchor.records.filter((r) => r.kind === "fact")
          const conceptRecords = anchor.records.filter(
            (r) => r.kind === "concept"
          )
          const ACTOR_KINDS = ["actor", "person", "location", "org", "entity"]
          const actorRecords = anchor.records.filter((r) =>
            ACTOR_KINDS.includes(r.kind)
          )
          const goThereUrl =
            buildLocatorUrl(
              sourceUrl,
              anchor.locator ?? selectedOccurrence?.locator ?? null
            ) || undefined
          const isFocus = anchor.anchorId === focusAnchorId

          const renderRecordGroup = (
            label: string,
            records: typeof anchor.records
          ) =>
            records.length ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {records.map((rec) => (
                    <button
                      key={rec.recordId}
                      type="button"
                      onClick={() => openSearchBranch(rec.textEn)}
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        border: "none",
                        borderRadius: 16,
                        padding: "3px 8px",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      {rec.textEn}
                    </button>
                  ))}
                </div>
              </div>
            ) : null

          return (
            <div
              key={anchor.anchorId}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(anchor.anchorId, el)
                } else {
                  itemRefs.current.delete(anchor.anchorId)
                }
              }}
              data-anchor-id={anchor.anchorId}
              onClick={() => {
                setFocusAnchorId(anchor.anchorId)
                setFetchParams(anchor.anchorId, "none")
                setPendingCenterAnchorId(anchor.anchorId)
              }}
              style={{
                cursor: "pointer",
                border: `1px solid ${
                  isFocus ? "var(--accent)" : "var(--border-subtle)"
                }`,
                background: isFocus ? "var(--accent-soft)" : "var(--surface)",
                borderRadius: 10,
                padding: "0.7em 0.9em",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isFocus && (
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "#fff",
                        borderRadius: 12,
                        padding: "2px 8px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      Focus
                    </span>
                  )}
                  <div style={{ fontWeight: 700 }}>
                    Context anchor{" "}
                    {anchor.pos !== undefined && anchor.pos !== null
                      ? `#${anchor.pos}`
                      : ""}
                  </div>
                </div>
                {goThereUrl && (
                  <a
                    href={goThereUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent)", fontWeight: 700 }}
                  >
                    Go there →
                  </a>
                )}
              </div>
              <div style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>
                {anchor.snippet}
              </div>
              {renderRecordGroup("Titles", titleRecords)}
              {renderRecordGroup("Facts", factRecords)}
              {renderRecordGroup("Concepts", conceptRecords)}
              {renderRecordGroup("Actors", actorRecords)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ContextTab
