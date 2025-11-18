import React from "react"
import type { UnitTopic } from "../../types/search"

interface TopicStripProps {
  topics: UnitTopic[]
  selectedUnitId: string | null
  onSelectUnit: (unitId: string) => void
}

const TopicStrip: React.FC<TopicStripProps> = ({
  topics,
  selectedUnitId,
  onSelectUnit,
}) => {
  return (
    <div
      className="topic-strip"
      style={{
        overflowX: "auto",
        display: "flex",
        gap: 12,
        padding: "0.5rem 0 1rem 0",
      }}
    >
      {topics.map((topic) => (
        <button
          key={topic.unitId}
          onClick={() => onSelectUnit(topic.unitId)}
          style={{
            background:
              topic.unitId === selectedUnitId
                ? "var(--accent)"
                : "var(--accent-soft)",
            color: topic.unitId === selectedUnitId ? "#fff" : "var(--accent)",
            border: "none",
            borderRadius: 18,
            padding: "0.4em 1.2em",
            fontWeight: 600,
            fontSize: topic.unitId === selectedUnitId ? "1.08em" : "1em",
            cursor: "pointer",
            boxShadow:
              topic.unitId === selectedUnitId
                ? "0 2px 8px 0 rgba(255,61,83,0.10)"
                : undefined,
            outline:
              topic.unitId === selectedUnitId
                ? "2px solid var(--accent)"
                : undefined,
            transition: "all 0.18s",
            marginBottom: 2,
          }}
        >
          {topic.title}
        </button>
      ))}
    </div>
  )
}

export default TopicStrip
