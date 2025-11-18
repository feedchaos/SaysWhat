import React from "react"

interface ProOnlyProps {
  tier: "free" | "pro"
  children: React.ReactNode
  label?: string
}

const ProOnly: React.FC<ProOnlyProps> = ({ tier, children, label }) => {
  if (tier === "pro") return <>{children}</>
  return (
    <div style={{ position: "relative", margin: "1.5em 0" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px dashed var(--accent)",
          borderRadius: 8,
          padding: "1em 1.2em",
          color: "var(--accent)",
          fontWeight: 600,
          marginBottom: 8,
          opacity: 0.95,
        }}
      >
        {label || "Pro preview – coming soon"}
      </div>
      <div style={{ opacity: 0.45 }}>{children}</div>
    </div>
  )
}

export default ProOnly
