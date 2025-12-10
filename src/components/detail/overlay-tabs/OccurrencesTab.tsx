import React from "react"
import { useDetailOverlay } from "../DetailOverlayContext"
import { buildLocatorUrl, formatLocator } from "../overlayUtils"

const OccurrencesTab: React.FC = () => {
  const {
    occurrences,
    selectedOccurrenceId,
    setSelectedOccurrenceId,
    setActiveTab,
    setFetchParams,
    setPendingCenterAnchorId,
    setFocusAnchorId,
    sourceUrl,
  } = useDetailOverlay()
  // console.log("OccurrencesTab render, occurrences:", occurrences)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxHeight: 280,
        overflowY: "auto",
        paddingRight: 6,
      }}
    >
      {occurrences.length === 0 && (
        <div style={{ color: "var(--text-muted)" }}>
          No occurrences were provided for this source yet.
        </div>
      )}
      {occurrences.map((occ) => {
        const goThereUrl = buildLocatorUrl(sourceUrl, occ.locator) || "#"
        const isSelected = selectedOccurrenceId === occ.anchorId
        return (
          <div
            key={occ.anchorId}
            onClick={() => {
              setSelectedOccurrenceId(occ.anchorId)
              setFocusAnchorId(occ.anchorId)
              setFetchParams(occ.anchorId, "none") // start corridor for this anchor
              setPendingCenterAnchorId(occ.anchorId)
              setActiveTab("context")
            }}
            style={{
              padding: "0.75em 0.8em",
              borderRadius: 10,
              border: `1px solid ${
                isSelected ? "var(--accent)" : "var(--border-subtle)"
              }`,
              background: isSelected ? "var(--accent-soft)" : "var(--surface)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              gap: "10vh",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                #{occ.occurrenceIndex} • {formatLocator(occ.locator)}
              </div>
              <div
                style={{ color: "var(--text-muted)", lineHeight: 1.35 }}
                title={occ.snippet}
              >
                {occ.snippet}
              </div>
            </div>
            <a
              href={goThereUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                alignSelf: "center",
                color: "var(--accent)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Go there →
            </a>
          </div>
        )
      })}
    </div>
  )
}

export default OccurrencesTab
