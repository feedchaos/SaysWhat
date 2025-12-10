import React, { useEffect, useRef, useState } from "react"

export interface DomainFilterProps {
  selectedDomains: string[]
  onChange: (domains: string[]) => void
}

const DOMAINS: string[] = [
  "politics",
  "economy",
  "finance",
  "business",
  "society",
  "law",
  "foreign_policy",
  "migration",
  "public_services",
  "education",
  "health",
  "science",
  "technology",
  "environment",
  "climate",
  "energy",
  "transportation",
  "housing",
  "media",
  "culture",
  "entertainment",
  "sports",
  "animals",
  "crime",
]

const DomainFilter: React.FC<DomainFilterProps> = ({
  selectedDomains,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const toggleDomain = (domain: string) => {
    const next = selectedDomains.includes(domain)
      ? selectedDomains.filter((d) => d !== domain)
      : [...selectedDomains, domain]
    onChange(next)
  }

  const summary =
    selectedDomains.length === 0
      ? "Any domain"
      : selectedDomains.length <= 2
      ? selectedDomains.join(", ")
      : `${selectedDomains.length} selected`

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        gap: 4,
        flex: 1,
        minWidth: 220,
      }}
    >
      <span>Domain(s)</span>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen((o) => !o)
          }
        }}
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 6,
          padding: "0.35rem 0.5rem",
          color: selectedDomains.length ? "var(--text)" : "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 34,
        }}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            paddingRight: 8,
          }}
        >
          {summary}
        </span>
        <span
          aria-hidden
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          {isOpen ? "^" : "v"}
        </span>
      </div>
      {isOpen ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "0.6rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem 0.9rem",
            }}
          >
            {DOMAINS.map((domain) => (
              <label
                key={domain}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.9rem",
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => toggleDomain(domain)}
                  style={{ cursor: "pointer" }}
                />
                <span>{domain}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DomainFilter
