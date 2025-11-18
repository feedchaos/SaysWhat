import React from "react"
import type { RecordAggregate } from "../../types/search"

interface ResultListProps {
  rec_agg: RecordAggregate[]
  selectedRecord: RecordAggregate | null
  onSelectRecord: (record: RecordAggregate) => void
  onShowDetail: () => void
  viewMode: "results" | "detail"
}

const kindColors: Record<string, string> = {
  title: "#ff3d53",
  fact: "#ffb13d",
  person: "#3dffb1",
  concept: "#3d7bff",
  other: "#b3b3b3",
}

const ResultList: React.FC<ResultListProps> = ({
  rec_agg,
  selectedRecord,
  onSelectRecord,
  onShowDetail,
  // viewMode,
}) => {
  if (!rec_agg.length) return null

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rec_agg.map((rec) => (
        <li
          key={rec.id}
          onClick={() => {
            onSelectRecord(rec)
            if (window.innerWidth < 800) onShowDetail()
          }}
          style={{
            background:
              selectedRecord?.id === rec.id
                ? "var(--accent-soft)"
                : "transparent",
            borderRadius: 8,
            padding: "0.9em 1em 0.7em 1em",
            marginBottom: 10,
            cursor: "pointer",
            border: "1px solid var(--border-subtle)",
            transition: "background 0.18s, border 0.18s",
            boxShadow:
              selectedRecord?.id === rec.id
                ? "0 2px 8px 0 rgba(255,61,83,0.08)"
                : undefined,
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: kindColors[rec.kind] || kindColors.other,
              color: "#fff",
              borderRadius: 6,
              fontSize: "0.85em",
              fontWeight: 600,
              padding: "0.1em 0.7em",
              marginRight: 10,
              marginBottom: 2,
            }}
          >
            {rec.kind}
          </span>
          <span
            style={{
              fontSize: "1.08em",
              fontWeight: 500,
              color: "var(--text)",
              display: "block",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "90%",
            }}
            title={rec.text}
          >
            {rec.text.length > 80 ? rec.text.slice(0, 77) + "…" : rec.text}
          </span>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.98em",
              marginTop: 2,
            }}
          >
            {Object.keys(rec.sources).map((src_id) => {
              console.log("source id", rec.sources[src_id].sourceTitle)
              return (
                <span key={rec.id + "_" + src_id} style={{ display: "block" }}>
                  {rec.sources[src_id].sourceTitle}
                </span>
              )
            })}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ResultList
