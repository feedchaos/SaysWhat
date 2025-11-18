import type {
  UnitTopic,
  UnitMeta,
  UnitEntityRef,
  RelatedOccurrence,
  RecordSummary,
} from "../../types/search"

export function makeMockTopics(record: RecordSummary): UnitTopic[] {
  // Use record.id to generate unique topics for each record
  const base = parseInt(record.id, 10) || 1
  return [
    { unitId: `u${base}`, title: `Topic ${base}`, position: 0.1 },
    { unitId: `u${base + 1}`, title: `Topic ${base + 1}`, position: 0.4 },
    { unitId: `u${base + 2}`, title: `Topic ${base + 2}`, position: 0.7 },
  ]
}

export function makeMockUnitMeta(
  unitId: string,
  record: RecordSummary
): UnitMeta {
  // Use unitId and record.id to generate dummy meta
  const n = parseInt(unitId.replace("u", ""), 10) || 1
  return {
    unitId,
    title: `Unit ${unitId.toUpperCase()} for ${record.sourceTitle}`,
    startTimeSec: n * 60,
    endTimeSec: n * 60 + 59,
    facts: [
      { id: `f${n}1`, kind: "fact", label: `Fact ${n}A` },
      { id: `f${n}2`, kind: "fact", label: `Fact ${n}B` },
      { id: `f${n}3`, kind: "fact", label: `Fact ${n}C` },
    ],
    titles: [
      { id: `t${n}1`, kind: "title", label: `Title ${n}A` },
      { id: `t${n}2`, kind: "title", label: `Title ${n}B` },
    ],
    persons: [
      { id: `p${n}1`, kind: "person", label: `Person ${n}A` },
      { id: `p${n}2`, kind: "person", label: `Person ${n}B` },
    ],
    concepts: [
      { id: `c${n}1`, kind: "concept", label: `Concept ${n}A` },
      { id: `c${n}2`, kind: "concept", label: `Concept ${n}B` },
      { id: `c${n}3`, kind: "concept", label: `Concept ${n}C` },
    ],
  }
}

export function makeMockRelated(
  entity: UnitEntityRef,
  record: RecordSummary
): RelatedOccurrence[] {
  if (!entity) return []
  // Use entity.id and record.id to generate dummy related occurrences
  return [
    {
      recordId: `${record.id}-rel1`,
      sourceId: record.sourceId,
      sourceTitle: record.sourceTitle,
      unitId: record.unitId,
      snippet: `Mentioned as ${entity.label} in ${record.sourceTitle}`,
    },
    {
      recordId: `${record.id}-rel2`,
      sourceId: record.sourceId,
      sourceTitle: record.sourceTitle,
      unitId: record.unitId,
      snippet: `Also appears as ${entity.label} in another context`,
    },
  ]
}
