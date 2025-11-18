import React from "react"
import type { UnitEntityRef, RelatedOccurrence } from "../../types/search"

interface RelatedEntitiesPanelProps {
  selectedEntity: UnitEntityRef | null
  related: RelatedOccurrence[]
  onSelectRelatedRecord: (recordId: string) => void
  onClose: () => void
}

const RelatedEntitiesPanel: React.FC<RelatedEntitiesPanelProps> = ({
  selectedEntity,
  related,
  onSelectRelatedRecord,
  onClose,
}) => {
  if (!selectedEntity) return null
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--surface)",
        borderTop: "1px solid var(--border-subtle)",
        boxShadow: "0 -2px 12px 0 rgba(0,0,0,0.10)",
        zIndex: 30,
        maxHeight: 260,
        overflowY: "auto",
        padding: "1.1rem 1.2rem 0.7rem 1.2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: "1.08em" }}>
          Where else does "{selectedEntity.label}" appear?
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontWeight: 700,
            fontSize: "1.2em",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
      {related.length === 0 ? (
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "1em",
            padding: "0.7em 0",
          }}
        >
          No other occurrences found.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {related.map((occ) => (
            <li
              key={occ.recordId}
              onClick={() => onSelectRelatedRecord(occ.recordId)}
              style={{
                padding: "0.7em 0.2em 0.7em 0",
                borderBottom: "1px solid var(--border-subtle)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--accent)",
                  marginBottom: 2,
                }}
              >
                {occ.sourceTitle}
              </div>
              {occ.snippet && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.98em" }}>
                  {occ.snippet}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RelatedEntitiesPanel
