import React from "react"
import type { RecordAggregate } from "../../types/search"
import SearchPanel from "../search/SearchPanel"
import DetailPanel from "../detail/DetailPanel"

interface MainLayoutProps {
  rec_agg: RecordAggregate[]
  selectedRecord: RecordAggregate | null
  onSelectRecord: (record: RecordAggregate) => void
  viewMode: "results" | "detail"
  setViewMode: (mode: "results" | "detail") => void
  tier: "free" | "pro"
  isSearching: boolean
  error: string | null
  query: string
}

const MainLayout: React.FC<MainLayoutProps> = ({
  rec_agg,
  selectedRecord,
  onSelectRecord,
  viewMode,
  setViewMode,
  tier,
  isSearching,
  error,
  query,
}) => {
  // Responsive: use CSS media queries for layout, but conditionally render for mobile
  return (
    <main
      style={{
        flex: 1,
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div className="main-layout" style={{ flex: 1, minHeight: 0 }}>
        {/* Desktop: two columns; Mobile: one panel at a time */}
        <div
          className={`panel search-panel${
            viewMode === "results" ? " active" : ""
          }`}
        >
          <SearchPanel
            rec_agg={rec_agg}
            selectedRecord={selectedRecord}
            onSelectRecord={onSelectRecord}
            onShowDetail={() => setViewMode("detail")}
            viewMode={viewMode}
            isSearching={isSearching}
            error={error}
            query={query}
          />
        </div>
        <div
          className={`panel detail-panel${
            viewMode === "detail" ? " active" : ""
          }`}
        >
          <DetailPanel
            record={selectedRecord}
            viewMode={viewMode}
            onBackToResults={() => setViewMode("results")}
            tier={tier}
          />
        </div>
      </div>
      <style>{`
        .main-layout {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          padding: 2rem 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .panel {
          flex: 1 1 0;
          min-width: 0;
          transition: transform 0.35s cubic-bezier(.77,0,.18,1), opacity 0.25s;
        }
        .search-panel {
          margin-right: 1rem;
        }
        .detail-panel {
          margin-left: 1rem;
          transform: translateX(40px);
          opacity: 0.7;
        }
        .detail-panel.active {
          transform: translateX(0);
          opacity: 1;
        }
        @media (max-width: 800px) {
          .main-layout {
            flex-direction: column;
            gap: 0;
            padding: 0.5rem 0.2rem;
          }
          .panel {
            margin: 0;
            width: 100%;
            min-width: 0;
            max-width: 100vw;
            display: none;
          }
          .panel.active {
            display: block;
            animation: fadeIn 0.3s;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
    </main>
  )
}

export default MainLayout
