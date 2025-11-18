export async function search(text: string) {
  if (!text) {
    throw new Error("Search text cannot be empty")
  }
  const res = await fetch("/api/v1/query:search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, k: 10 }),
  })
  if (!res.ok) {
    return `Error: ${res.status} ${await res.text()}`
  }
  const data = await res.json()
  return data
}
