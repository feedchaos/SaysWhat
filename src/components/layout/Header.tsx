import React, { useMemo } from "react"
import "../../styles/global.css"
import type { Tier } from "../../AuthContext"

interface HeaderProps {
  tier: Tier
  expiresAt: string | null
  onSignIn: () => void
  onSignOut: () => void
}

const Header: React.FC<HeaderProps> = ({
  tier,
  expiresAt,
  onSignIn,
  onSignOut,
}) => {
  const expiryText = useMemo(() => {
    if (!expiresAt) return null
    const date = new Date(expiresAt)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString()
  }, [expiresAt])

  const isPro = tier === "pro"

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
        <span>SaysWhat</span>
        <span style={{ fontSize: "0.5rem", marginLeft: "0.5rem" }}>by</span>
      </div>
      <a
        href="https://www.feedchaos.com"
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          flexShrink: 0,
          marginLeft: "1rem",
        }}
      >
        <img
          src="/icons-128.png"
          alt="FeedChaos"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </a>
      <div
        style={{
          paddingLeft: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.85rem",
          flexWrap: "wrap",
          rowGap: "0.35rem",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            flexWrap: "nowrap",
            flexShrink: 0,
          }}
        >
          <button
            onClick={isPro ? onSignOut : onSignIn}
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {isPro ? "Sign out" : "Sign in"}
          </button>
        </div>
        {isPro ? (
          <span
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderRadius: "999px",
              padding: "0.3em 1em",
              fontWeight: 600,
              fontSize: "0.65rem",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              textAlign: "right",
            }}
          >
            Expires{expiryText ? ` ${expiryText}` : ""}
          </span>
        ) : (
          <span
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderRadius: "999px",
              padding: "0.3em 1em",
              fontWeight: 600,
              fontSize: "0.95rem",
              letterSpacing: "0.01em",
              textAlign: "right",
            }}
          >
            Free
          </span>
        )}
      </div>
    </header>
  )
}

export default Header
