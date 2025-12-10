import { createContext, useContext } from "react"

export type Tier = "free" | "pro"

export interface AuthState {
  tier: Tier
  token: string | null
  expiresAt: string | null
}

interface AuthContextValue {
  auth: AuthState
  setAuthState: (state: AuthState) => void
  clearAuth: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}

/* export function getStoredAuthState(): AuthState {
  return loadStoredAuth()
} */
