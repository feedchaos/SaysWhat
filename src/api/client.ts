import {
  API_BASE_URL,
  DEFAULT_SEARCH_LIMIT,
  DEFAULT_KINDS,
  DEFAULT_PER_SOURCE_LIMIT,
} from "../config"
import type { RecordAggregate, SearchRequest } from "../types/search"
import type { AuthState } from "../AuthContext"
import { apiFetch } from "./http"

export async function searchRecords(
  params: SearchRequest,
  auth?: AuthState
): Promise<RecordAggregate[]> {
  const {
    text,
    result_limit = DEFAULT_SEARCH_LIMIT,
    per_source_limit = DEFAULT_PER_SOURCE_LIMIT,
    kinds = DEFAULT_KINDS,
    since_epoch,
    until_epoch,
    domains_primary,
  } = params

  const body = {
    text,
    result_limit: result_limit,
    per_source_limit: per_source_limit,
    kinds,
    since_epoch,
    until_epoch,
    domains_primary,
    // label_filters: { domain: "politics" }, // leave commented or optional for now
  }

  const res = await apiFetch(
    `${API_BASE_URL}/v1/query:search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    auth
  )

  if (!res.ok) {
    // For now, throw a simple error; we can improve UX later.
    const text = await res.text()
    throw new Error(`Search failed: ${res.status} ${text}`)
  }

  const json = await res.json()
  // console.log("Search results", json)

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
  // console.log("Mapping search response items", items)
  const rec_agg: RecordAggregate[] = []
  for (const rec of items) {
    // console.log("Mapping rec", rec)
    const existing = rec_agg.findIndex((r) => r.id === rec.record_id)

    const mappedSource = {
      sourceId: rec.source_id,
      sourceTitle: rec.source_title,
      score: 1 - rec.dist,
      url: rec.source_url,
      anchors: [
        {
          anchorId: rec.anchor_id,
          locator: rec.locator,
        },
      ],
      locator: rec.locator,
      sourceMeta: rec.source_meta || {},
    }
    if (existing === -1) {
      rec_agg.push({
        id: rec.record_id,
        kind: rec.kind ?? "other",
        text: rec.text_en ?? rec.text ?? "[not available]",
        source_count: rec.r_source_count ?? 1,
        sources: {
          [rec.source_id as string]: mappedSource,
        },
      })
    } else if (rec.source_id in rec_agg[existing].sources) {
      rec_agg[existing].sources[rec.source_id as string].anchors.push(
        mappedSource.anchors[0]
      )
    } else {
      rec_agg[existing].sources[rec.source_id as string] = mappedSource
    }
  }
  // console.log("Mapped RecordAggregates", rec_agg)

  return rec_agg
}
