import React, { useEffect, useMemo, useState } from "react"
import OverlayShell from "./OverlayShell"
import OverlayTabsHeader from "./overlay-tabs/OverlayTabsHeader"
import OccurrencesTab from "./overlay-tabs/OccurrencesTab"
import ContextTab from "./overlay-tabs/ContextTab"
import SourceInfoTab from "./overlay-tabs/SourceInfoTab"
import {
  DetailOverlayContext,
  type DetailOverlayContextValue,
  type ProPanelTab,
  type ContextAnchor,
} from "./DetailOverlayContext"
import { buildOccurrences, getBaseSourceUrl } from "./overlayUtils"
import type { RecordAggregate } from "../../types/search"
import { INITIAL_WINDOW, FETCH_WINDOW } from "./overlay-tabs/contextConfig"
import { API_BASE_URL } from "../../config"

type BackendContextRecord = {
  record_id: string
  kind: string
  text_en: string
  meta_json?: any
}

type BackendContextAnchor = {
  anchor_id: string
  source_id: string
  start_char: number | null
  end_char: number | null
  locator: number | null
  pos: number | null
  records: BackendContextRecord[]
}

type BackendContextResponse = {
  focus_record_id: string
  focus_anchor_id: string | null
  window: number
  anchors: BackendContextAnchor[]
}

export interface ProPanelOverlayProps {
  isOpen: boolean
  record: RecordAggregate | null
  sourceId: string | null
  tier: "free" | "pro"
  onClose: () => void
}

const OverlayPanel: React.FC<ProPanelOverlayProps> = ({
  isOpen,
  record,
  sourceId,
  tier,
  onClose,
}) => {
  const isPro = tier === "pro"
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    sourceId
  )
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<ProPanelTab>("occurrences")
  const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(
    null
  )
  const [contextAnchors, setContextAnchors] = useState<ContextAnchor[]>([])
  const [focusAnchorId, setFocusAnchorId] = useState<string | null>(null)
  const [fetchAnchorId, setFetchAnchorId] = useState<string | null>(null)
  const [fetchDirection, setFetchDirection] = useState<
    "none" | "plus" | "minus"
  >("none")
  const [fetchVersion, setFetchVersion] = useState(0)
  const [minPos, setMinPos] = useState<number | null>(null)
  const [maxPos, setMaxPos] = useState<number | null>(null)

  // NEW: explicit “phase” flag + centering target
  const [initialContextLoaded, setInitialContextLoaded] = useState(false)
  const [pendingCenterAnchorId, setPendingCenterAnchorId] = useState<
    string | null
  >(null)

  const setFetchParams = (
    anchorId: string | null,
    direction: "none" | "plus" | "minus" = "none"
  ) => {
    setFetchAnchorId(anchorId)
    setFetchDirection(direction)
    setFetchVersion((v) => v + 1)
  }

  const setPosBounds = (min: number | null, max: number | null) => {
    setMinPos(min)
    setMaxPos(max)
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedSourceId(
        sourceId ||
          (record?.sources ? Object.keys(record.sources)[0] ?? null : null)
      )
      setActiveTab("occurrences")
      setShowFullDescription(false)
    }
  }, [isOpen, record, sourceId])

  const occurrences = useMemo(
    () => buildOccurrences(record, selectedSourceId),
    [record, selectedSourceId]
  )

  const currentSource =
    selectedSourceId && record?.sources
      ? record.sources[selectedSourceId]
      : null

  const mapBackendAnchors = (
    data: any,
    fallbackSnippet: string
  ): ContextAnchor[] => {
    const rawAnchors =
      (Array.isArray(data?.anchors) && data.anchors) ||
      (Array.isArray(data?.context_anchors) && data.context_anchors) ||
      (Array.isArray(data?.context) && data.context) ||
      (Array.isArray(data?.corridor) && data.corridor) ||
      []

    return rawAnchors.map((a: any) => {
      const records = Array.isArray(a?.records) ? a.records : []
      const firstRecord = records[0]
      return {
        anchorId: a.anchor_id,
        sourceId: a.source_id,
        startChar: a.start_char ?? null,
        endChar: a.end_char ?? null,
        locator: a.locator ?? null,
        pos: a.pos ?? null,
        snippet: firstRecord?.text_en ?? fallbackSnippet,
        records: records.map((r: any) => ({
          recordId: r.record_id,
          kind: r.kind,
          textEn: r.text_en,
        })),
      }
    })
  }

  // When occurrences or source changes, (re)start corridor around first occurrence
  useEffect(() => {
    if (occurrences.length) {
      const firstAnchorId = occurrences[0].anchorId
      setSelectedOccurrence(firstAnchorId)
      setContextAnchors([])
      setPosBounds(null, null)
      setInitialContextLoaded(false)
      setPendingCenterAnchorId(firstAnchorId)
      setFocusAnchorId(firstAnchorId)
      setFetchParams(firstAnchorId, "none")
    } else {
      setSelectedOccurrence(null)
      setContextAnchors([])
      setPosBounds(null, null)
      setInitialContextLoaded(false)
      setPendingCenterAnchorId(null)
      setFocusAnchorId(null)
      setFetchParams(null, "none")
    }
  }, [occurrences, selectedSourceId])

  useEffect(() => {
    setShowFullDescription(false)
  }, [selectedSourceId])

  const mergeByAnchorId = (
    existing: ContextAnchor[],
    incoming: ContextAnchor[]
  ): ContextAnchor[] => {
    const byId = new Map<string, ContextAnchor>()
    for (const a of existing) byId.set(a.anchorId, a)
    for (const a of incoming) byId.set(a.anchorId, a)
    return Array.from(byId.values()).sort((a, b) => {
      const pa = a.pos ?? 0
      const pb = b.pos ?? 0
      return pa - pb
    })
  }

  // Fetch corridor or extend it, depending on fetchDirection
  useEffect(() => {
    if (!isOpen || !record || !fetchAnchorId) {
      // Closing or no anchor to fetch → clear context
      setContextAnchors([])
      setPosBounds(null, null)
      setInitialContextLoaded(false)
      return
    }

    const controller = new AbortController()
    const fetchDirectionLocal = fetchDirection ?? "none"
    const windowSize =
      fetchDirectionLocal === "none" ? INITIAL_WINDOW : FETCH_WINDOW

    const fetchContextAnchors = async () => {
      try {
        const params = new URLSearchParams({
          window: String(windowSize),
          direction: fetchDirectionLocal,
        })
        const response = await fetch(
          `${API_BASE_URL}/v1/context/by-anchor/${encodeURIComponent(
            String(fetchAnchorId)
          )}?${params.toString()}`,
          { signal: controller.signal }
        )
        if (!response.ok) {
          console.error(
            "Failed to fetch context anchors",
            await response.text()
          )
          if (fetchDirectionLocal === "none") {
            setContextAnchors([])
            setPosBounds(null, null)
            setInitialContextLoaded(false)
          }
          return
        }
        const data: BackendContextResponse = await response.json()
        // console.log("Fetched context anchors", data)

        const anchors = mapBackendAnchors(data, record.text)
        if (!anchors.length && fetchDirectionLocal === "none") {
          console.warn(
            "Empty anchors from /context/by-anchor on initial fetch, falling back to record context"
          )
          const fallbackRes = await fetch(
            `${API_BASE_URL}/v1/record/${encodeURIComponent(
              record.id
            )}/context?window=${INITIAL_WINDOW}`,
            { signal: controller.signal }
          )
          if (fallbackRes.ok) {
            const fallbackData: BackendContextResponse =
              await fallbackRes.json()
            const fallbackAnchors = mapBackendAnchors(fallbackData, record.text)
            setContextAnchors((prev) => {
              const merged = mergeByAnchorId(prev, fallbackAnchors)
              const positions = merged
                .map((a) => a.pos)
                .filter((p): p is number => typeof p === "number")
              setPosBounds(
                positions.length ? Math.min(...positions) : null,
                positions.length ? Math.max(...positions) : null
              )
              return merged
            })
            setInitialContextLoaded(true)
          } else {
            console.error(
              "Fallback context fetch failed",
              await fallbackRes.text()
            )
            setContextAnchors([])
            setPosBounds(null, null)
            setInitialContextLoaded(false)
          }
        } else if (anchors.length) {
          setContextAnchors((prev) => {
            const merged = mergeByAnchorId(prev, anchors)
            const positions = merged
              .map((a) => a.pos)
              .filter((p): p is number => typeof p === "number")
            setPosBounds(
              positions.length ? Math.min(...positions) : null,
              positions.length ? Math.max(...positions) : null
            )
            return merged
          })
          if (fetchDirectionLocal === "none") {
            setInitialContextLoaded(true)
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("Error fetching context anchors", err)
        if (fetchDirectionLocal === "none") {
          setContextAnchors([])
          setPosBounds(null, null)
          setInitialContextLoaded(false)
        }
      }
    }

    fetchContextAnchors()
    return () => controller.abort()
  }, [isOpen, record, fetchAnchorId, fetchDirection, fetchVersion])

  if (!isOpen || !record) return null

  const sourceOptions = record.sources ? Object.keys(record.sources) : []
  const sourceUrl =
    selectedSourceId && currentSource
      ? getBaseSourceUrl(selectedSourceId, currentSource)
      : null

  const renderFreeTeaser = () => (
    <div style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
      <p style={{ marginTop: 0 }}>
        Upgrade to Pro to unlock everything in this panel:
      </p>
      <ul style={{ paddingLeft: 18, margin: "0 0 1em 0" }}>
        <li>Occurrences: every mention of this record in this source.</li>
        <li>Context: browse ± units without re-running your search.</li>
        <li>Source info: full description, tags, and counts.</li>
      </ul>
      <button
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "0.65em 1em",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Upgrade to Pro
      </button>
    </div>
  )

  const title = "Pro panel"
  const subtitle = `${record.kind} • ${record.text.slice(0, 60)}${
    record.text.length > 60 ? "…" : ""
  }`

  const ctxValue: DetailOverlayContextValue = {
    tier,
    isPro,
    record,
    sourceOptions,
    selectedSourceId,
    setSelectedSourceId,
    currentSource,
    activeTab,
    setActiveTab,
    occurrences,
    selectedOccurrenceId: selectedOccurrence,
    setSelectedOccurrenceId: setSelectedOccurrence,
    contextAnchors,
    focusAnchorId,
    setFocusAnchorId,
    fetchAnchorId,
    setFetchAnchorId: (anchorId) => setFetchParams(anchorId, "none"),
    setFetchParams,
    minPos,
    maxPos,
    setPosBounds,
    // NEW:
    pendingCenterAnchorId,
    setPendingCenterAnchorId,
    initialContextLoaded,
    sourceUrl,
    showFullDescription,
    setShowFullDescription,
  }

  return (
    <OverlayShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
    >
      <DetailOverlayContext.Provider value={ctxValue}>
        {sourceOptions.length > 1 && (
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                color: "var(--text-muted)",
                fontWeight: 600,
                marginRight: 8,
              }}
            >
              Source:
            </label>
            <select
              value={selectedSourceId ?? ""}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              style={{
                padding: "0.45em 0.6em",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
              }}
            >
              {sourceOptions.map((id) => (
                <option key={id} value={id}>
                  {record.sources?.[id]?.sourceTitle || id}
                </option>
              ))}
            </select>
          </div>
        )}

        {isPro ? (
          <>
            <OverlayTabsHeader />
            <div
              style={{
                minHeight: 240,
                height: "100%",
                display: "flex",
                flex: 1,
              }}
            >
              {activeTab === "occurrences" && <OccurrencesTab />}
              {activeTab === "context" && <ContextTab />}
              {activeTab === "sourceInfo" && <SourceInfoTab />}
            </div>
          </>
        ) : (
          renderFreeTeaser()
        )}
      </DetailOverlayContext.Provider>
    </OverlayShell>
  )
}

export default OverlayPanel
