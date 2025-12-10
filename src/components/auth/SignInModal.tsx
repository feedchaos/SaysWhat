import React, { useState } from "react"
import { redeemTrialCode } from "../../api/auth"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSignedIn: (auth: { token: string; expiresAt: string | null }) => void
}

const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSignedIn,
}) => {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError("Enter a code to continue")
      return
    }
    try {
      setIsSubmitting(true)
      setError(null)
      const res = await redeemTrialCode(code.trim())
      // console.log("res", res)
      onSignedIn({ token: res.token, expiresAt: res.expiresAt })
      setCode("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 380,
          width: "100%",
          padding: "1.5rem",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          background: "var(--surface)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Sign in to Pro</h3>
        <p style={{ marginTop: 0, color: "var(--text-muted)" }}>
          Enter your trial code to unlock Pro results.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter trial code"
            style={{
              flex: 1,
              padding: "0.75rem 0.9rem",
              borderRadius: 8,
              border: "1px solid var(--border-subtle)",
              background: "rgba(255,255,255,0.02)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0 1rem",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#0b0508",
              fontWeight: 700,
              cursor: "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              minWidth: 90,
            }}
          >
            {isSubmitting ? "Checking…" : "Submit"}
          </button>
        </form>
        {error && (
          <div style={{ color: "#ff8a80", marginTop: 10, fontSize: "0.95rem" }}>
            {error}
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            background: "none",
            color: "var(--text-muted)",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default SignInModal
