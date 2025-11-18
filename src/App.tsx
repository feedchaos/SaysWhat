import React, { useState } from "react"
import "./styles/global.css"
import Header from "./components/layout/Header"
import SearchBar from "./components/search/SearchBar"
import MainLayout from "./components/layout/MainLayout"
import type { RecordAggregate } from "./types/search"
import { searchRecords } from "./api/client"

const App: React.FC = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<RecordAggregate[]>([])
  const [selectedRecord, setSelectedRecord] = useState<RecordAggregate | null>(
    null
  )
  const [viewMode, setViewMode] = useState<"results" | "detail">("results")
  const [tier, setTier] = useState<"free" | "pro">("pro")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    const text = query.trim()
    if (!text) {
      setResults([])
      setSelectedRecord(null)
      setError(null)
      return
    }
    try {
      setIsSearching(true)
      setError(null)
      const rec_agg = await searchRecords({ text })

      console.log("aggregated results", rec_agg)
      setResults(rec_agg)
      setSelectedRecord(rec_agg[0] ?? null)
    } catch (err) {
      console.error("Search error", err)
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      )
      setResults([])
      setSelectedRecord(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectRecord = (rec: RecordAggregate) => {
    setSelectedRecord(rec)
    if (window.innerWidth < 800) setViewMode("detail")
  }

  // Optionally: allow tier toggle for demo
  const handleTierToggle = () => {
    setTier((t) => (t === "free" ? "pro" : "free"))
  }

  return (
    <div className="app-background">
      <Header tier={tier} onTierToggle={handleTierToggle} />
      <SearchBar query={query} onChange={setQuery} onSubmit={handleSearch} />
      <MainLayout
        rec_agg={results}
        selectedRecord={selectedRecord}
        onSelectRecord={handleSelectRecord}
        viewMode={viewMode}
        setViewMode={setViewMode}
        tier={tier}
        isSearching={isSearching}
        error={error}
        query={query}
      />
    </div>
  )
}

export default App
