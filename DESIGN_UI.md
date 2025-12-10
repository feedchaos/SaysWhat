## Pro Detail Panel, Kind Filters, and Exploration Flows

### 1. Overview

The main search UI stays as-is:

- **Left:** Search form + results grouped by source.
- **Right:** Detail panel for the currently selected record.

On top of this, we add:

1. **Kind filters** (checkboxes) to control which record kinds are visible.
2. A **Pro-only floating detail panel** (tabbed overlay) that gives:
   - All occurrences of a record in a given source.
   - Browsable context around each occurrence (± units).
   - Rich source metadata (description + tags, counts).

Free users can still:

- Discover sources and click through to the original video/page.
- Use the main search and the static detail panel.
- Use a **“Search This”** button to branch into new searches.

The Pro panel is an _overlay_, not a replacement for the main UI. Closing it never modifies the underlying search state or layout.

Target personas for Pro:

- Organizations (e.g., newsrooms, research desks) using SaysWhat as an ongoing service.
- Typical setup: we ingest ~100+ initial sources, then continuously ingest their preferred or newly discovered channels/sources.

---

### 2. Kind Filters (checkboxes)

We treat clutter as a **UI concern**, not a backend limitation.

- We do **not** hard-disable any record kind at the backend.
- Instead, we expose **checkboxes** for the user to choose what they see.

#### 2.1. UI behavior

- A “Result kinds” control appears near the search box (or at the top of the results list).
- It shows a checkbox per known kind, for example:

  - `fact`
  - `title`
  - `concept`
  - `actor` (person)
  - (others as they appear)

- Some kinds may be **unchecked by default** if they tend to clutter the view (e.g., `concept`), but the user can always enable them.

The filter behavior has two layers:

1. **Display filter (MVP, required):**

   - The backend can return all allowed kinds.
   - The UI hides any results whose kind is currently unchecked.
   - This is the simplest behavior and avoids breaking existing logic.

2. **Optional query filter (later / optimization):**
   - The UI can also send the selected kinds back to S4 as `SearchRequest.kinds`.
   - S4 then filters on `kind = ANY($kinds)` as it already supports.
   - UI still applies display filtering to stay robust if backend defaults change.

The same selected kinds also control **which records can open the Pro panel** (see below). In MVP, the panel _can_ work for any kind; the user filters via checkboxes if they find concepts too noisy.

---

### 3. Thumbnail Behavior

For each source block:

- The **thumbnail click** opens the source URL in a **new tab**, with no extra query parameters:
  - For example, a YouTube URL is opened without `&t=...`.
- The backend still returns **locator** for anchors, but that is used **only inside the Pro panel**.
- This makes thumb behavior simple and predictable, while keeping fine-grained navigation as a Pro feature.

---

### 4. Pro Detail Panel (floating overlay)

The Pro panel is a floating overlay anchored to the **right side** of the viewport:

- Opens when the user clicks a **Pro button** on a record’s source block or in the detail panel.
- Has its own resizable width (e.g., via a drag handle on the left edge).
- Is fully modular; the only connection to the existing UI is:
  - The **“Open Pro panel”** button, which passes the currently selected record and source to the panel.
- Closing the panel:
  - Does not modify search results, detail panel selection, or scroll positions.
  - Simply hides the overlay.

There are two modes:

1. **Free user:**

   - The panel opens as a **teaser/marketing panel**.
   - It describes the three Pro tabs, with concrete examples (e.g., “See all 17 mentions in this source,” “Browse ± 5 units around any claim,” “See full source description and tags”).
   - Contains an “Upgrade to Pro” call-to-action.
   - No live occurrence/context/meta data is shown.

2. **Pro user:**
   - The panel opens with a **tabbed interface** (see below).
   - Uses live data for occurrences, context, and source meta.

---

### 5. Shared Panel State

The Pro panel maintains a small internal state:

- `selectedRecordId`
- `selectedSourceId`
- `selectedOccurrence` (anchor ID / index for the current record in this source)
- `contextCursor` (unit index or window around the selected occurrence)
- `activeTab` (`"occurrences" | "context" | "sourceInfo"`)

This state is **local to the panel component**. It does not affect the rest of the app.

All three tabs read and/or update this state, allowing smooth navigation without re-querying on every tab switch.

---

### 6. Tab 1: Occurrences

**Goal:** Show all occurrences of the current record in the current source, with one-click jumps and a bridge into Context.

Data model (conceptual, not final):

```ts
type Occurrence = {
  anchorId: string
  occurrenceIndex: number // 1-based index within this record+source
  locator: number | null // ms for video, page*100 + fractional for PDF, etc.
  unitIndex: number | null // index of the unit containing this anchor
  snippet: string // short text around the anchor
}
```

## UI:

- A scrollable list of occurrences, for example:

  - #1 • 01:23 – “...we will send an envoy to Cairo...”
  - #2 • 03:47 – “...the ceasefire talks in Cairo...”
  - etc.

- For video:
  - Locator is formatted as mm:ss.
- For paged docs:
  - Locator is shown as page 3.2 (page + fractional position).

Each row offers:

1. A “Go there” icon/link:

- Opens the source in a new tab at the given locator (e.g. YouTube with &t=locator_ms/1000).

2. Row click behavior:

- Sets selectedOccurrence to this anchor.
- Switches activeTab to "context".
- The Context tab then centers its view around this unit.

This avoids the user needing to click repeatedly between tabs; a single click on an occurrence leads directly into context.

---

### 7. Tab 2: Context (browsable ± units)

## Goal: Let the user browse the transcript context around the currently selected occurrence, without re-running the original search.

Conceptually:

- The transcript is segmented into units (u0, u1, u2, …).
- Each occurrence/anchor is associated with a unit index (e.g., u23).
- The Context tab renders a dynamic, scrollable window of units around a focus unit.

Initial window:

- When the panel opens, or when the user selects an occurrence in Tab 1:
  - contextCursor is set to the unit index containing that occurrence (e.g., 23).
  - The tab renders a window such as:
    - u18 ... u28 (e.g., ±5 units around the focus).

Dynamic expansion:

- As the user scrolls toward the top or bottom of the current list:
  - The panel requests additional units from the backend (or from a local cache), e.g.:
    - Above top → add u10–u17.
    - Below bottom → add u29–u36.
- This creates a smooth “infinite scroll” feeling over the units for this source.

Each unit row:

- Shows:
  - u23 (unit index).
  - Optional unit title/summary (if extracted).
  - A short snippet of text (first couple of lines).
  - Visual highlighting for:
    - The focus unit (the one containing selectedOccurrence).
    - Units containing one or more search hits (optional later).
  - Includes a “Go there” link:
    - Opens the source in a new tab at the unit’s representative locator.

The Context tab is always interpreted within a single source. It doesn’t run new searches; it just navigates the pre-ingested units for that source.

### 8. Tab 3: Source Info

Goal: Provide enough metadata to digest the source without having to leave the app.

Data comes from:

- sources.source_meta
- Other basic fields on sources (e.g., title, url, platform)

UI:

- Header:
  - Channel / uploader name.
  - Source title.
- Stats:
  - Publish date.
  - Views, likes, comments (if present).
  - Duration (if present).
- Description:
  - Full uploader description, rendered as text (with “show more” if huge).
- Tags:
  - List of tags as inline chips (if present).
- Links:
  - “Open on YouTube / source platform” (opens in new tab).

No extra analytics or history beyond these basic counts and tags.

### 9. Pro Gating

- The Pro button that opens the panel is visible to all users.
- Free users:
  - See a static teaser version of the panel with copy describing:
    - Occurrences tab (all mentions + “Go there”).
    - Context tab (browsable ± units).
    - Source info (full description/tags).
  - All interactive, data-driven content is disabled or replaced with placeholder examples.
- Pro users:
  - See fully functional tabs, powered by actual data for the selected record + source.

The gating logic should be centralized (e.g., a simple isPro flag obtained from auth/user state) and the Pro panel component should accept that flag as a prop.

### 10. “Search This” Button (Exploration Flows)

Every record (in the list and in the detail panel) gets a “Search This” button.

Behavior:

- On click:
  - Opens a new browser tab with the app’s search page.
  - Pre-populates the search input with the record’s text_en (or a truncated version if it’s long).
  - Optionally sets initial filters (e.g., default kinds); MVP can just reuse the default search filters.
- The original tab remains unchanged, keeping the current search and selection.

This enables “branching paths” of exploration:

- The user finds an interesting claim/concept.
- Clicks “Search This” to spin up a new search just for that expression.
- They can later return to the original tab and continue from where they left off.
