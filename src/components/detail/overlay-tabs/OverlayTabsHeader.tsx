import React from "react"
import { useDetailOverlay } from "../DetailOverlayContext"

const OverlayTabsHeader: React.FC = () => {
  const { activeTab, setActiveTab } = useDetailOverlay()

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {(
        [
          ["occurrences", "Occurrences"],
          ["context", "Context"],
          ["sourceInfo", "Source info"],
        ] as [typeof activeTab, string][]
      ).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          style={{
            flex: 1,
            padding: "0.55em 0.8em",
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background:
              activeTab === key ? "var(--accent-soft)" : "var(--surface)",
            color: activeTab === key ? "var(--accent)" : "var(--text)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default OverlayTabsHeader
