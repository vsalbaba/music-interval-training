Status: completed

# Interval song snippets and lookup index

## What to build

Create the song snippet data layer: a collection of `.abc` files and a typed metadata index with a lookup function.

**File structure:** A `songs/` directory under the music module containing:
- 3-5 `.abc` files, each a short ABC notation snippet (up to ~16 notes) from a well-known song that demonstrates a specific interval
- An `index.ts` that imports each `.abc` file via `?raw`, defines the `SongSnippet` type, and exports a lookup function

**SongSnippet type shape:**
- `title`: song name (e.g. "Star Wars")
- `interval`: interval shortName from the existing `Interval` type (e.g. "P5")
- `direction`: "ascending" or "descending"
- `abc`: the raw ABC string (from the `?raw` import)

**Lookup function:** Given an interval shortName and direction, return all matching `SongSnippet` entries. One interval per entry, multiple entries per interval allowed.

Each `.abc` file must include standard ABC headers (`X:`, `T:`, `K:`, `L:`) and be valid standalone ABC notation. The snippets should be sourced from well-known melodies commonly used as interval memory aids.

## Acceptance criteria

- [ ] `songs/` directory exists with 3-5 `.abc` files covering at least 3 different intervals
- [ ] Each `.abc` file has standard ABC headers and a single-voice melody line
- [ ] `SongSnippet` type is exported with title, interval, direction, and abc fields
- [ ] Lookup function returns all snippets matching a given interval + direction
- [ ] Lookup returns an empty array for intervals with no associated snippets
- [ ] Each snippet is playable via the ABC playback utility from issue #15

## Blocked by

- Issue #15 (ABC snippet playback with abcjs)
