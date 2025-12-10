import React from "react"
import DateRangeFilter from "./DateRangeFilter"
import DomainFilter from "./DomainFilter"

export interface SearchFiltersProps {
  dateFrom: string | null
  dateTo: string | null
  onDateFromChange: (value: string | null) => void
  onDateToChange: (value: string | null) => void
  selectedDomains: string[]
  onDomainsChange: (domains: string[]) => void
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selectedDomains,
  onDomainsChange,
}) => {
  return (
    <div
      className="filters-row"
      style={{
        display: "flex",
        gap: "0.5rem",
        margin: "0.5rem 1.5rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
      />
      <DomainFilter
        selectedDomains={selectedDomains}
        onChange={onDomainsChange}
      />
    </div>
  )
}

export default SearchFilters
