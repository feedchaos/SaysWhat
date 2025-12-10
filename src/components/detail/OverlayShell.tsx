import React, { useEffect, useState } from "react"

interface OverlayShellProps {
  isOpen: boolean
  width?: number
  title?: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}

const OverlayShell: React.FC<OverlayShellProps> = ({
  isOpen,
  width = "70vw",
  title,
  subtitle,
  onClose,
  children,
}) => {
  const [panelWidth, setPanelWidth] = useState(width)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    setPanelWidth(width)
  }, [width])

  useEffect(() => {
    if (!isResizing) return
    const handleMove = (e: MouseEvent) => {
      const desiredWidth = window.innerWidth - e.clientX - 16
      setPanelWidth(
        Math.min(window.innerWidth - 16, Math.max(340, desiredWidth))
      )
    }
    const handleUp = () => setIsResizing(false)
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [isResizing])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 66,
        right: 12,
        height: "calc(100vh - 96px)",
        width: panelWidth,
        background: "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        zIndex: 20,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      <div
        onMouseDown={(e) => {
          e.preventDefault()
          setIsResizing(true)
        }}
        style={{
          width: 10,
          cursor: "col-resize",
          background: "linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0))",
        }}
      />
      <div
        style={{
          flex: 1,
          padding: "1rem 1.2rem",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div>
            {title && (
              <div style={{ fontWeight: 700, fontSize: "1.05em" }}>{title}</div>
            )}
            {subtitle && (
              <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "var(--surface)",
              color: "var(--text-muted)",
              fontSize: "1.2em",
              cursor: "pointer",
            }}
            aria-label={`Close ${title ?? "panel"}`}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default OverlayShell
