import React from "react"

export interface DateRangeFilterProps {
  dateFrom: string | null
  dateTo: string | null
  onDateFromChange: (val: string | null) => void
  onDateToChange: (val: string | null) => void
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.8rem",
  color: "var(--text-muted)",
  gap: 4,
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  padding: "0.35rem 0.5rem",
  color: "var(--text)",
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <label style={labelStyle}>
        <span>Upload from</span>
        <input
          type="date"
          value={dateFrom ?? ""}
          onChange={(e) => onDateFromChange(e.target.value || null)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        <span>Upload to</span>
        <input
          type="date"
          value={dateTo ?? ""}
          onChange={(e) => onDateToChange(e.target.value || null)}
          style={inputStyle}
        />
      </label>
    </div>
  )
}

export default DateRangeFilter
