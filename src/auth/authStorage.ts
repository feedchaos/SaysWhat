// src/authStorage.ts
import type { AuthState } from "../AuthContext"

const STORAGE_KEY = "sayswhat.auth"

export const defaultAuthState: AuthState = {
  tier: "free",
  token: null,
  expiresAt: null,
}

export function loadStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAuthState
    const parsed = JSON.parse(raw)
    if (parsed?.token) {
      return {
        tier: "pro",
        token: String(parsed.token),
        expiresAt: parsed.expiresAt ?? parsed.expires_at ?? null,
      }
    }
  } catch (err) {
    console.warn("Failed to read auth from storage", err)
  }
  return defaultAuthState
}

export function persistAuth(state: AuthState) {
  try {
    if (state.token) {
      const payload = {
        token: state.token,
        expiresAt: state.expiresAt,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (err) {
    console.warn("Failed to persist auth", err)
  }
}

// Optional helper if you still want it
export function getStoredAuthState(): AuthState {
  return loadStoredAuth()
}
