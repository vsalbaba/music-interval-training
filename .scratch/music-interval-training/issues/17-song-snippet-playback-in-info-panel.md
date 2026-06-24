Status: completed

# Song snippet playback in info panel

## What to build

Wire the song snippet data into the interval info panel so users can hear reference songs for each interval.

In the interval reference table (from issue #12), each interval row that has associated song snippets gets a play button. When tapped:
1. The snippet's melody plays via the ABC playback utility
2. The song title is shown next to the interval row (e.g. "Star Wars")

If multiple snippets exist for an interval (e.g. two songs that both start with an ascending P5), show all of them -- each with its own play button and title.

Intervals with no associated snippets show no play button -- they just display the interval reference info as before.

The direction for lookup should be "ascending" since the app currently plays intervals ascending. This can be expanded later.

## Acceptance criteria

- [ ] Interval rows with associated song snippets show a play button and song title
- [ ] Tapping the play button plays the ABC snippet melody
- [ ] Multiple snippets per interval are all shown
- [ ] Intervals with no snippets display normally with no play button
- [ ] Playback does not interfere with the exercise play button or other audio
- [ ] Styling is consistent with the existing info panel design

## Blocked by

- Issue #13 (info panel split layout with toggle)
- Issue #16 (interval song snippets and lookup index)
