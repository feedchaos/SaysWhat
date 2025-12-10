import { API_BASE_URL } from "../config"
import { apiFetch } from "./http"

export interface TrialCodeResponse {
  token: string
  expiresAt: string | null
}

export async function redeemTrialCode(
  code: string
): Promise<TrialCodeResponse> {
  const res = await apiFetch(`${API_BASE_URL}/v1/auth/trial-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  })

  if (res.status === 401) {
    throw new Error("Invalid or expired code")
  }
  if (!res.ok) {
    throw new Error("Sign-in failed")
  }

  const json = await res.json()
  // console.log("Sign-in response", json)
  return {
    token: json.code ?? json.token,
    expiresAt: json.expiresAt ?? json.expires_at ?? null,
  }
}
