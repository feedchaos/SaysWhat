import React from "react"
import type { RecordAggregate, RecordKind } from "../../types/search"
import ResultList from "./ResultList"
import KindFilters from "./KindFilters"

interface SearchPanelProps {
  rec_agg: RecordAggregate[]
  selectedRecord: RecordAggregate | null
  onSelectRecord: (record: RecordAggregate) => void
  onShowDetail: () => void
  viewMode: "results" | "detail"
  isSearching: boolean
  error: string | null
  query: string
  availableKinds: RecordKind[]
  selectedKinds: RecordKind[]
  onSelectedKindsChange: (kinds: RecordKind[]) => void
  onOpenProPanel: (record: RecordAggregate, sourceId?: string) => void
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  rec_agg,
  selectedRecord,
  onSelectRecord,
  onShowDetail,
  viewMode,
  isSearching,
  error,
  query,
  availableKinds,
  selectedKinds,
  onSelectedKindsChange,
  onOpenProPanel,
}) => {
  // Info text logic
  let infoText = "Use the filters and start searching."
  if (query && rec_agg.length > 0) {
    infoText = `Showing ${rec_agg.length} records for "${query}"`
  } else if (query && rec_agg.length === 0 && !isSearching && !error) {
    infoText = `No records found for "${query}".`
  }

  return (
    <section
      className="card"
      style={{
        flex: 1,
        minHeight: 0,
        marginBottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: rec_agg.length === 0 ? "center" : "flex-start",
        alignItems: rec_agg.length === 0 ? "center" : undefined,
        textAlign: rec_agg.length === 0 ? "center" : undefined,
      }}
    >
      <div
        style={{
          color: "var(--text-muted)",
          fontSize: "1.05rem",
          marginBottom: rec_agg.length === 0 ? 0 : 16,
        }}
      >
        {isSearching ? (
          <span style={{ color: "var(--accent)" }}>Searching…</span>
        ) : error ? (
          <span style={{ color: "#e57373" }}>{error}</span>
        ) : (
          infoText
        )}
      </div>
      <KindFilters
        availableKinds={availableKinds}
        selectedKinds={selectedKinds}
        onSelectedKindsChange={onSelectedKindsChange}
      />
      <ResultList
        rec_agg={rec_agg}
        selectedRecord={selectedRecord}
        onSelectRecord={onSelectRecord}
        onShowDetail={onShowDetail}
        viewMode={viewMode}
        onOpenProPanel={onOpenProPanel}
      />
    </section>
  )
}

export default SearchPanel
