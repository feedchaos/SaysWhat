import React from "react"
import { useDetailOverlay } from "../DetailOverlayContext"
import { openSearchBranch } from "../../../utils/searchNavigation"

const SourceInfoTab: React.FC = () => {
  const {
    currentSource,
    sourceUrl,
    showFullDescription,
    setShowFullDescription,
  } = useDetailOverlay()

  const meta = currentSource?.sourceMeta || {}
  const statsMeta = meta.stats || {}
  const metadata = meta.metadata || {}
  const title =
    meta.title ||
    currentSource?.sourceTitle ||
    currentSource?.title ||
    "Untitled source"
  const channelName =
    (typeof meta.channel === "string"
      ? meta.channel
      : meta.channel?.name || meta.channel?.title) ||
    meta.uploader ||
    meta.owner ||
    meta.author ||
    currentSource?.channel
  const channelUrl =
    (typeof meta.channel === "object" && meta.channel?.url) ||
    meta.channel_url ||
    metadata.channel_url
  const channelHandle = meta.channel?.handle || meta.channel?.id || meta.handle
  const followerCount = meta.channel?.channel_follower_count

  const description: string | undefined =
    meta.description || metadata.description || currentSource?.description
  const tags = Array.isArray(meta.tags)
    ? meta.tags
    : Array.isArray(metadata.tags)
    ? metadata.tags
    : Array.isArray(currentSource?.tags)
    ? currentSource.tags
    : []

  const publishedRaw =
    statsMeta.timestamp ||
    meta.published_at ||
    meta.publish_date ||
    meta.upload_date
  const observedAt = statsMeta.observed_at
  const views =
    statsMeta.view_count ??
    meta.views ??
    meta.view_count ??
    currentSource?.views ??
    currentSource?.view_count
  const likes =
    statsMeta.like_count ??
    meta.likes ??
    meta.like_count ??
    currentSource?.likes
  const comments =
    statsMeta.comment_count ??
    meta.comments ??
    meta.comment_count ??
    currentSource?.comments
  const duration =
    statsMeta.duration_secs ??
    meta.duration ??
    meta.length ??
    currentSource?.duration
  const language = statsMeta.language || meta.language || metadata.language
  const categories =
    Array.isArray(metadata.categories) && metadata.categories.length
      ? metadata.categories
      : null

  const formatNumber = (val: any) => {
    if (val === undefined || val === null) return null
    const num = typeof val === "number" ? val : Number(val)
    return Number.isFinite(num) ? num.toLocaleString() : String(val)
  }
  const formatDate = (val: any) => {
    if (!val) return null
    const isEpochSeconds = typeof val === "number" && val < 2_000_000_000
    const d = new Date(isEpochSeconds ? val * 1000 : val)
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString()
  }
  const formatDuration = (val: any) => {
    if (typeof val === "string") return val
    if (typeof val === "number") {
      const minutes = Math.floor(val / 60)
      const seconds = Math.floor(val % 60)
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
    return null
  }

  const stats = [
    views !== undefined && views !== null
      ? { label: "Views", value: formatNumber(views) }
      : null,
    likes !== undefined && likes !== null
      ? { label: "Likes", value: formatNumber(likes) }
      : null,
    comments !== undefined && comments !== null
      ? { label: "Comments", value: formatNumber(comments) }
      : null,
    duration ? { label: "Duration", value: formatDuration(duration) } : null,
    language ? { label: "Language", value: language } : null,
  ].filter(Boolean) as { label: string; value: string | null }[]

  const timing = [
    publishedRaw
      ? { label: "Published", value: formatDate(publishedRaw) }
      : null,
    observedAt ? { label: "Observed", value: formatDate(observedAt) } : null,
  ].filter(Boolean) as { label: string; value: string | null }[]

  const shouldTruncate = description && description.length > 320
  const renderedDescription =
    description && shouldTruncate && !showFullDescription
      ? description.slice(0, 320) + "…"
      : description

  const openLabel =
    meta.platform === "youtube" ? "Open on YouTube" : "Open source"
  const score = currentSource?.score

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxHeight: 520,
        overflowY: "auto",
        paddingRight: 4,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1.08em" }}>{title}</div>
          {channelName && (
            <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
              {channelUrl ? (
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--accent)",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  {channelName}
                </a>
              ) : (
                channelName
              )}
              {channelHandle && (
                <span style={{ marginLeft: 6, color: "var(--text-muted)" }}>
                  · {channelHandle}
                </span>
              )}
            </div>
          )}
          {(followerCount || score !== undefined) && (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                color: "var(--text-muted)",
                marginTop: 6,
              }}
            >
              {followerCount ? (
                <span>Followers: {formatNumber(followerCount)}</span>
              ) : null}
              {score !== undefined ? (
                <span>Score: {formatNumber(score)}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {(stats.length > 0 || timing.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          {stats.map((stat) => (
            <div
              key={`${stat.label}-${stat.value}`}
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "0.65em 0.75em",
                background: "var(--surface)",
              }}
            >
              <div style={{ color: "var(--text-muted)", fontSize: "0.92em" }}>
                {stat.label}
              </div>
              <div style={{ fontWeight: 700 }}>{stat.value}</div>
            </div>
          ))}
          {timing.map((t) => (
            <div
              key={`${t.label}-${t.value}`}
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "0.65em 0.75em",
                background: "var(--surface)",
              }}
            >
              <div style={{ color: "var(--text-muted)", fontSize: "0.92em" }}>
                {t.label}
              </div>
              <div style={{ fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      )}

      {(categories || metadata.platform || meta.platform) && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            color: "var(--text-muted)",
          }}
        >
          {meta.platform || metadata.platform ? (
            <span style={{ fontWeight: 700 }}>
              Platform: {meta.platform || metadata.platform}
            </span>
          ) : null}
          {categories?.map((cat: string) => (
            <span
              key={cat}
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                padding: "4px 8px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {renderedDescription && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Description</div>
          <div style={{ color: "var(--text-muted)", lineHeight: 1.45 }}>
            {renderedDescription}
          </div>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullDescription((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 6,
                padding: 0,
              }}
            >
              Show {showFullDescription ? "less" : "more"}
            </button>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Tags{" "}
            <span style={{ color: "var(--text-muted)" }}>
              • Click to search
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => openSearchBranch(tag)}
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  padding: "4px 7px",
                  borderRadius: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.9em",
                }}
                title="Search this tag"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--accent)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {openLabel} →
        </a>
      )}
    </div>
  )
}

export default SourceInfoTab
