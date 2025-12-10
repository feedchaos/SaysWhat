import React from "react"
import type { RecordAggregate } from "../../types/search"

interface DetailPanelProps {
  record: RecordAggregate | null
  viewMode: "results" | "detail"
  onBackToResults: () => void
  tier: "free" | "pro"
  onSelectRecordById?: (recordId: string) => void
  onOpenProPanel?: (record: RecordAggregate, sourceId?: string) => void
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  record,
  viewMode,
  onBackToResults,
  tier: _tier,
  onSelectRecordById: _onSelectRecordById,
  onOpenProPanel,
}) => {
  // Mobile: show back bar
  return (
    <section
      className="card"
      style={{ minHeight: 400, position: "relative", overflow: "hidden" }}
    >
      {viewMode === "detail" && (
        <div className="mobile-back-bar" style={{ display: "none" }}>
          <button
            onClick={onBackToResults}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: "1.1em",
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            ← Results
          </button>
        </div>
      )}
      <style>{`
        @media (max-width: 800px) {
          .mobile-back-bar {
            display: block !important;
            margin-bottom: 1.2em;
          }
        }
      `}</style>
      {!record ? (
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "1.15em",
            marginTop: 40,
          }}
        >
          Pick a record on the left to see the story behind it.
        </div>
      ) : (
        <div style={{ position: "relative", minHeight: 320 }}>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "1.05em",
              marginBottom: 6,
            }}
          >
            {record.kind}
          </div>

          <div
            style={{
              fontSize: "1.25em",
              fontWeight: 500,
              margin: "1.2em 0 1.5em 0",
              color: "var(--text)",
            }}
          >
            {record.text}
          </div>
          {record.sources &&
            Object.keys(record.sources).map((src_id) => {
              const thumbUrl = `https://i.ytimg.com/vi/${src_id}/hqdefault.jpg`
              const baseUrl =
                record.sources[src_id]?.url ||
                `https://www.youtube.com/watch?v=${src_id}`
              return (
                <div
                  key={src_id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    minHeight: "8vh",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <a href={baseUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={thumbUrl}
                      style={{ marginRight: 10, height: "8vh" }}
                    />
                  </a>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <h3
                      style={{
                        margin: "0 0 0.4em 0",
                        color: "var(--accent)",
                        fontWeight: 700,
                      }}
                    >
                      {record.sources[src_id].sourceTitle}
                    </h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <a
                        href={baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--text-muted)",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        Open source →
                      </a>
                      <button
                        onClick={() =>
                          onOpenProPanel && onOpenProPanel(record, src_id)
                        }
                        style={{
                          border: "1px solid var(--accent)",
                          background: "var(--surface)",
                          color: "var(--accent)",
                          borderRadius: 8,
                          padding: "0.3em 0.8em",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Open Pro panel
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </section>
  )
}

export default DetailPanel
