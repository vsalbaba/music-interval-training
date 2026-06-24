Status: completed

# Info panel mobile responsive overlay

## What to build

On screens narrower than 768px (`md` breakpoint), the info panel should render as a full-width overlay instead of a side-by-side split.

When the Info toggle is tapped on mobile:
- The info panel covers the exercise area as a full-width overlay
- The key picker and reference table remain fully functional
- A close button (or tapping Info again) dismisses the overlay
- The fretboard at the bottom remains visible and unaffected

## Acceptance criteria

- [ ] Below 768px viewport width, the info panel renders as a full-width overlay
- [ ] Above 768px, the existing 50/50 split layout is used
- [ ] Overlay has a close/dismiss mechanism
- [ ] Fretboard remains visible below the overlay
- [ ] Key picker and reference table are fully usable in overlay mode

## Blocked by

- Issue #13 (info panel split layout with toggle)
