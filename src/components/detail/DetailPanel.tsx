import React, { useEffect, useState } from "react"
import type {
  RecordSummary,
  UnitTopic,
  UnitMeta,
  UnitEntityRef,
  RelatedOccurrence,
} from "../../types/search"
import TopicStrip from "./TopicStrip"
import UnitMetaPanel from "./UnitMetaPanel"
import RelatedEntitiesPanel from "./RelatedEntitiesPanel"
import {
  makeMockTopics,
  makeMockUnitMeta,
  makeMockRelated,
} from "./mockDetailData"

interface DetailPanelProps {
  record: RecordSummary | null
  viewMode: "results" | "detail"
  onBackToResults: () => void
  tier: "free" | "pro"
  onSelectRecordById?: (recordId: string) => void
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  record,
  viewMode,
  onBackToResults,
  tier,
  onSelectRecordById,
}) => {
  // Combine all detail state into one object to avoid cascading setState warnings
  type DetailState = {
    topics: UnitTopic[]
    selectedUnitId: string | null
    unitMeta: UnitMeta | null
    isUnitMetaOpen: boolean
    selectedEntity: UnitEntityRef | null
    related: RelatedOccurrence[]
  }
  const [detailState, setDetailState] = useState<DetailState>({
    topics: [],
    selectedUnitId: null,
    unitMeta: null,
    isUnitMetaOpen: false,
    selectedEntity: null,
    related: [],
  })

  // When record changes, reset all state and mock new data
  useEffect(() => {
    if (!record) {
      setDetailState({
        topics: [],
        selectedUnitId: null,
        unitMeta: null,
        isUnitMetaOpen: false,
        selectedEntity: null,
        related: [],
      })
      return
    }
    const t = makeMockTopics(record)
    const defaultUnitId = record.unitId ?? t[0]?.unitId ?? null
    setDetailState({
      topics: t,
      selectedUnitId: defaultUnitId,
      unitMeta: defaultUnitId ? makeMockUnitMeta(defaultUnitId, record) : null,
      isUnitMetaOpen: false,
      selectedEntity: null,
      related: [],
    })
  }, [record])

  // When selectedUnitId changes, update unitMeta
  useEffect(() => {
    if (record && detailState.selectedUnitId) {
      setDetailState((prev) => ({
        ...prev,
        unitMeta: makeMockUnitMeta(detailState.selectedUnitId!, record),
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailState.selectedUnitId, record])

  // Handlers
  const handleSelectUnit = (unitId: string) => {
    setDetailState((prev) => ({
      ...prev,
      selectedUnitId: unitId,
      unitMeta: record ? makeMockUnitMeta(unitId, record) : null,
    }))
  }

  const handleEntityClick = (entity: UnitEntityRef) => {
    setDetailState((prev) => ({
      ...prev,
      selectedEntity: entity,
      related: record ? makeMockRelated(entity, record) : [],
      isUnitMetaOpen: true,
    }))
  }

  const handleSelectRelatedRecord = (recordId: string) => {
    if (onSelectRecordById) onSelectRecordById(recordId)
    setDetailState((prev) => ({
      ...prev,
      selectedEntity: null,
      related: [],
    }))
  }

  const handleCloseRelated = () => {
    setDetailState((prev) => ({
      ...prev,
      selectedEntity: null,
      related: [],
    }))
  }

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
          <h2
            style={{
              margin: "0 0 0.5em 0",
              color: "var(--accent)",
              fontWeight: 700,
            }}
          >
            {record.sourceTitle}
          </h2>
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
          <TopicStrip
            topics={detailState.topics}
            selectedUnitId={detailState.selectedUnitId}
            onSelectUnit={handleSelectUnit}
          />
          <UnitMetaPanel
            unitMeta={detailState.unitMeta}
            isOpen={detailState.isUnitMetaOpen}
            onToggle={() =>
              setDetailState((prev) => ({
                ...prev,
                isUnitMetaOpen: !prev.isUnitMetaOpen,
              }))
            }
            tier={tier}
            onEntityClick={handleEntityClick}
          />
          <RelatedEntitiesPanel
            selectedEntity={detailState.selectedEntity}
            related={detailState.related}
            onSelectRelatedRecord={handleSelectRelatedRecord}
            onClose={handleCloseRelated}
          />
        </div>
      )}
    </section>
  )
}

export default DetailPanel
