import { API_BASE_URL, DEFAULT_SEARCH_LIMIT, DEFAULT_KINDS } from "../config"
import type { RecordAggregate } from "../types/search"

export interface SearchParams {
  text: string
  limit?: number
  kinds?: string[]
  // later: label_filters, etc.
}

export async function searchRecords(
  params: SearchParams
): Promise<RecordAggregate[]> {
  const { text, limit = DEFAULT_SEARCH_LIMIT, kinds = DEFAULT_KINDS } = params

  const body = {
    text,
    k: limit,
    kinds,
    // label_filters: { domain: "politics" }, // leave commented or optional for now
  }

  const res = await fetch(`${API_BASE_URL}/v1/query:search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    // For now, throw a simple error; we can improve UX later.
    const text = await res.text()
    throw new Error(`Search failed: ${res.status} ${text}`)
  }

  const json = await res.json()
  console.log("Search results", json)

  return mapS4SearchResponseToRecordSummaries(json)
}

// TODO: adjust this once we know the exact API shape.
function mapS4SearchResponseToRecordSummaries(json: any): RecordAggregate[] {
  if (!json) return []

  // Assume either:
  //  - json.results is an array
  //  - or json.records is an array
  const items: any[] = Array.isArray(json.results)
    ? json.results
    : Array.isArray(json.records)
    ? json.records
    : []
  console.log("Mapping search response items", items)
  const rec_agg: RecordAggregate[] = []
  for (const rec of items) {
    console.log("Mapping rec", rec)
    const existing = rec_agg.findIndex((r) => r.id === rec.record_id)
    if (existing === -1) {
      rec_agg.push({
        id: rec.record_id,
        kind: rec.kind ?? "other",
        text: rec.text_en ?? rec.text ?? "[not available]",
        sources: {
          [rec.source_id as string]: {
            sourceTitle: rec.source_title,
            unitId: rec.unitId,
            score: 1 - rec.dist,
          },
        },
      })
    } else {
      rec_agg[existing].sources[rec.source_id as string] = {
        sourceTitle: rec.source_title,
        unitId: rec.unitId,
        score: 1 - rec.dist,
      }
    }
  }
  console.log("Mapped RecordAggregates", rec_agg)

  return rec_agg
}
