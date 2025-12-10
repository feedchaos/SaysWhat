import React from "react"
import type { RecordKind } from "../../types/search"

interface KindFiltersProps {
  availableKinds: RecordKind[]
  selectedKinds: RecordKind[]
  onSelectedKindsChange: (kinds: RecordKind[]) => void
}

const labelMap: Partial<Record<RecordKind, string>> = {
  person: "actor",
}

const KindFilters: React.FC<KindFiltersProps> = ({
  availableKinds,
  selectedKinds,
  onSelectedKindsChange,
}) => {
  if (!availableKinds.length) return null

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        margin: "0 0 10px 0",
        fontSize: "0.9rem",
      }}
    >
      <span
        style={{
          fontWeight: 600,
          color: "var(--text-muted)",
          fontSize: "0.95rem",
          marginRight: 6,
        }}
      >
        Result kinds:
      </span>
      {availableKinds.map((kind) => {
        const checked = selectedKinds.includes(kind)
        const handleChange = () => {
          const next = checked
            ? selectedKinds.filter((k) => k !== kind)
            : [...selectedKinds, kind]
          onSelectedKindsChange(next)
        }
        return (
          <label
            key={kind}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 3px",
              borderRadius: 7,
              border: `1px solid ${
                checked ? "var(--accent)" : "var(--border-subtle)"
              }`,
              background: checked ? "var(--accent-soft)" : "var(--surface)",
              color: checked ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={handleChange}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
            {labelMap[kind] || kind}
          </label>
        )
      })}
    </div>
  )
}

export default KindFilters
