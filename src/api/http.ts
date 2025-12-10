import { getStoredAuthState } from "../auth/authStorage"
import type { AuthState } from "../AuthContext"

type RequestArgs = [RequestInfo | URL, RequestInit?]

export async function apiFetch(
  input: RequestArgs[0],
  init: RequestArgs[1] = {},
  authOverride?: AuthState
) {
  const auth = authOverride ?? getStoredAuthState()

  const headers = new Headers(init.headers || undefined)
  if (auth.token) {
    headers.set("Authorization", `Bearer ${auth.token}`)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
