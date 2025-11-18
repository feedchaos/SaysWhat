import React from "react"
import type { UnitMeta, UnitEntityRef } from "../../types/search"
import ProOnly from "../common/ProOnly"

interface UnitMetaPanelProps {
  unitMeta: UnitMeta | null
  isOpen: boolean
  onToggle: () => void
  tier: "free" | "pro"
  onEntityClick: (entity: UnitEntityRef) => void
}

const entitySection = (
  label: string,
  entities: UnitEntityRef[],
  tier: "free" | "pro",
  onEntityClick: (entity: UnitEntityRef) => void
) => {
  if (!entities.length) return null
  const maxFree = 2
  const showAll = tier === "pro"
  const shown = showAll ? entities : entities.slice(0, maxFree)
  const more =
    !showAll && entities.length > maxFree ? entities.length - maxFree : 0
  return (
    <ProOnly
      tier={tier}
      label={label + (tier === "free" ? " (Pro preview)" : "")}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {shown.map((entity) => (
            <button
              key={entity.id}
              onClick={() => onEntityClick(entity)}
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "none",
                borderRadius: 8,
                padding: "0.2em 0.8em",
                fontWeight: 500,
                fontSize: "1em",
                cursor: "pointer",
                opacity: 0.95,
              }}
            >
              {entity.label}
            </button>
          ))}
          {more > 0 && (
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.98em",
                marginLeft: 6,
              }}
            >
              +{more} more (Pro)
            </span>
          )}
        </div>
      </div>
    </ProOnly>
  )
}

const formatTime = (sec?: number) => {
  if (typeof sec !== "number") return ""
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

const UnitMetaPanel: React.FC<UnitMetaPanelProps> = ({
  unitMeta,
  isOpen,
  onToggle,
  tier,
  onEntityClick,
}) => {
  if (!unitMeta) return null
  return (
    <section
      className="card"
      style={{ marginBottom: 18, marginTop: 8, padding: "1.1rem 1.2rem" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isOpen ? 10 : 0,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "1.1em" }}>Unit meta</div>
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontWeight: 600,
            fontSize: "1.1em",
            cursor: "pointer",
          }}
        >
          {isOpen ? "−" : "+"}
        </button>
      </div>
      {isOpen && (
        <div>
          <div style={{ fontWeight: 600, fontSize: "1.08em", marginBottom: 4 }}>
            {unitMeta.title}
          </div>
          {(unitMeta.startTimeSec !== undefined ||
            unitMeta.endTimeSec !== undefined) && (
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "0.98em",
                marginBottom: 8,
              }}
            >
              {formatTime(unitMeta.startTimeSec)}
              {unitMeta.endTimeSec !== undefined
                ? ` – ${formatTime(unitMeta.endTimeSec)}`
                : ""}
            </div>
          )}
          {entitySection("Titles", unitMeta.titles, tier, onEntityClick)}
          {entitySection("Facts", unitMeta.facts, tier, onEntityClick)}
          {entitySection("People", unitMeta.persons, tier, onEntityClick)}
          {entitySection("Concepts", unitMeta.concepts, tier, onEntityClick)}
        </div>
      )}
    </section>
  )
}

export default UnitMetaPanel
