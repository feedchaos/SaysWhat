import { DEFAULT_KINDS } from "../config"

export type RecordKind = (typeof DEFAULT_KINDS)[number]

export interface SearchRequest {
  text: string
  result_limit?: number
  per_source_limit?: number
  kinds?: RecordKind[]
  since_epoch?: number
  until_epoch?: number
  domains_primary?: string[]
}

export interface RecordSummary {
  id: string
  kind: RecordKind
  text: string
  [key: string]: string | number | undefined
}

export interface RecordAggregate {
  id: string
  kind: RecordKind
  text: string
  sources: {
    [sourceId: string]: any
  }
  [key: string]: any
}

export interface UnitTopic {
  unitId: string
  title: string
  /** Approximate position of this unit within the source, 0..1 */
  position: number
}

export type EntityKind = (typeof DEFAULT_KINDS)[number]

export interface UnitEntityRef {
  id: string
  kind: EntityKind
  label: string
}

export interface UnitMeta {
  unitId: string
  title: string
  startTimeSec?: number
  endTimeSec?: number
  facts: UnitEntityRef[]
  titles: UnitEntityRef[]
  persons: UnitEntityRef[]
  concepts: UnitEntityRef[]
}

export interface RelatedOccurrence {
  recordId: string
  sourceId: string
  sourceTitle: string
  unitId?: string
  snippet?: string
}
