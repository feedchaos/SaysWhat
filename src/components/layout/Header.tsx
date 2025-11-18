import React from "react"
import "../../styles/global.css"

interface HeaderProps {
  tier: "free" | "pro"
  onTierToggle?: () => void
}

const Header: React.FC<HeaderProps> = ({ tier }) => {
  return (
    <header
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 2rem 0.75rem 1.5rem",
        background: "rgba(8,2,5,0.85)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.5rem",
          letterSpacing: "-1px",
          color: "var(--accent)",
        }}
      >
        sayswhat
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <span
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent)",
            borderRadius: "999px",
            padding: "0.3em 1em",
            fontWeight: 600,
            fontSize: "0.95rem",
            letterSpacing: "0.01em",
          }}
        >
          {tier.charAt(0).toUpperCase() + tier.slice(1)} tier
        </span>
        <button
          style={{
            background: "none",
            border: "1px solid var(--border-subtle)",
            color: "var(--text)",
            borderRadius: "6px",
            padding: "0.3em 1em",
            fontWeight: 500,
            cursor: "pointer",
            opacity: 0.85,
            transition: "opacity 0.2s",
          }}
        >
          Sign in
        </button>
      </div>
    </header>
  )
}

export default Header
