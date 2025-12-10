export const openSearchBranch = (text: string) => {
  if (!text) return
  const trimmed = text.trim().slice(0, 180)
  const url = new URL(window.location.href)
  url.searchParams.set("q", trimmed)
  window.open(url.toString(), "_blank", "noopener,noreferrer")
}
