import { useState, useEffect, useMemo } from "react"
import type { AuthState } from "./AuthContext"
import { AuthContext } from "./AuthContext"
import { loadStoredAuth, persistAuth } from "./auth/authStorage"

const defaultState: AuthState = {
  tier: "free",
  token: null,
  expiresAt: null,
}
export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>(() => loadStoredAuth())
  // console.log("AuthProvider initialized with auth:", auth)

  useEffect(() => {
    persistAuth(auth)
  }, [auth])

  const setAuthState = (state: AuthState) => setAuth(state)
  const clearAuth = () => setAuth(defaultState)

  const value = useMemo(
    () => ({
      auth,
      setAuthState,
      clearAuth,
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
