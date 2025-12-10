import React, { useMemo, useState, useEffect, useCallback } from "react"
import "./styles/global.css"
import Header from "./components/layout/Header"
import SearchBar from "./components/search/SearchBar"
import MainLayout from "./components/layout/MainLayout"
import SearchFilters from "./components/search/SearchFilters"
import type { RecordAggregate, RecordKind } from "./types/search"
import { searchRecords } from "./api/client"
import { DEFAULT_KINDS } from "./config"
import OverlayPanel from "./components/detail/OverlayPanel"
import { useAuth } from "./AuthContext"
import SignInModal from "./components/auth/SignInModal"

const BASE_KINDS: RecordKind[] = [...DEFAULT_KINDS, "other"] as RecordKind[]
const DEFAULT_VISIBLE_KINDS: RecordKind[] = BASE_KINDS as RecordKind[]

const normalizeKind = (kind: string): RecordKind =>
  BASE_KINDS.includes(kind as RecordKind) ? (kind as RecordKind) : "fact"

const App: React.FC = () => {
  const { auth, setAuthState, clearAuth } = useAuth()
  const tier = auth.tier
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<RecordAggregate[]>([])
  const [selectedRecord, setSelectedRecord] = useState<RecordAggregate | null>(
    null
  )
  const [viewMode, setViewMode] = useState<"results" | "detail">("results")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedKinds, setSelectedKinds] = useState<RecordKind[]>(
    DEFAULT_VISIBLE_KINDS
  )
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const [domainsPrimary, setDomainsPrimary] = useState<string[]>([])
  const [initialQuery, setInitialQuery] = useState<string | null>(null)
  const [proPanelState, setProPanelState] = useState<{
    isOpen: boolean
    record: RecordAggregate | null
    sourceId: string | null
  }>({
    isOpen: false,
    record: null,
    sourceId: null,
  })
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  const availableKinds = useMemo<RecordKind[]>(() => {
    const set = new Set<RecordKind>(BASE_KINDS)
    results.forEach((rec) => set.add(normalizeKind(rec.kind)))
    return Array.from(set)
  }, [results])

  const filteredResults = useMemo(
    () =>
      results.filter((rec) => selectedKinds.includes(normalizeKind(rec.kind))),
    [results, selectedKinds]
  )

  useEffect(() => {
    if (
      selectedRecord &&
      !filteredResults.find((r) => r.id === selectedRecord.id)
    ) {
      setSelectedRecord(filteredResults[0] ?? null)
    } else if (!selectedRecord && filteredResults.length) {
      setSelectedRecord(filteredResults[0])
    } else if (!filteredResults.length) {
      setSelectedRecord(null)
    }
  }, [filteredResults, selectedRecord])

  const toEpoch = (dateStr: string | null): number | undefined => {
    if (!dateStr) return undefined
    const t = new Date(dateStr).getTime()
    if (!Number.isFinite(t)) return undefined
    return Math.floor(t / 1000)
  }

  const handleSearch = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? query).trim()
      if (!text) {
        setResults([])
        setSelectedRecord(null)
        setError(null)
        return
      }
      try {
        setIsSearching(true)
        setError(null)
        const rec_agg = await searchRecords(
          {
            text,
            result_limit: 20,
            per_source_limit: 5,
            kinds: selectedKinds.length ? selectedKinds : undefined,
            since_epoch: toEpoch(dateFrom),
            until_epoch: toEpoch(dateTo),
            domains_primary: domainsPrimary.length ? domainsPrimary : undefined,
          },
          auth
        )

        // console.log("aggregated results", rec_agg)
        setResults(rec_agg)
        setSelectedRecord(rec_agg[0] ?? null)
      } catch (err) {
        console.error("Search error", err)
        setError(
          err instanceof Error
            ? err.message
            : "Search failed. Please try again."
        )
        setResults([])
        setSelectedRecord(null)
      } finally {
        setIsSearching(false)
      }
    },
    [query, selectedKinds, dateFrom, dateTo, domainsPrimary, auth]
  )

  useEffect(() => {
    const params = new URL(window.location.href).searchParams
    const q = params.get("q")
    if (q) {
      setQuery(q)
      setInitialQuery(q)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
      setInitialQuery(null)
    }
  }, [initialQuery, handleSearch])

  const handleSelectRecord = (rec: RecordAggregate) => {
    setSelectedRecord(rec)
    if (window.innerWidth < 800) setViewMode("detail")
  }

  const handleSelectedKindsChange = (kinds: RecordKind[]) => {
    // Avoid empty filters; keep prior selection if all unchecked.
    if (!kinds.length) return
    setSelectedKinds(kinds)
  }

  const handleOpenProPanel = (record: RecordAggregate, sourceId?: string) => {
    const fallbackSourceId =
      sourceId || Object.keys(record.sources || {})[0] || null
    setProPanelState({
      isOpen: true,
      record,
      sourceId: fallbackSourceId,
    })
  }

  const handleCloseProPanel = () => {
    setProPanelState((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <div className="app-background">
      <Header
        tier={tier}
        expiresAt={auth.expiresAt}
        onSignIn={() => setIsSignInOpen(true)}
        onSignOut={clearAuth}
      />
      <SearchFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selectedDomains={domainsPrimary}
        onDomainsChange={setDomainsPrimary}
      />
      <SearchBar query={query} onChange={setQuery} onSubmit={handleSearch} />
      <MainLayout
        rec_agg={filteredResults}
        selectedRecord={selectedRecord}
        onSelectRecord={handleSelectRecord}
        viewMode={viewMode}
        setViewMode={setViewMode}
        tier={tier}
        isSearching={isSearching}
        error={error}
        query={query}
        availableKinds={availableKinds}
        selectedKinds={selectedKinds}
        onSelectedKindsChange={handleSelectedKindsChange}
        onOpenProPanel={handleOpenProPanel}
      />
      <OverlayPanel
        isOpen={proPanelState.isOpen}
        record={proPanelState.record}
        sourceId={proPanelState.sourceId}
        tier={tier}
        onClose={handleCloseProPanel}
      />
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignedIn={({ token, expiresAt }) =>
          setAuthState({ tier: "pro", token, expiresAt })
        }
      />
    </div>
  )
}

export default App
