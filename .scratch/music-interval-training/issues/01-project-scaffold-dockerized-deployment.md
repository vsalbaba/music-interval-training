Status: completed

# Project scaffold + Dockerized deployment

## Parent

[PRD](../PRD.md)

## What to build

Set up a SvelteKit project with a Dockerfile that builds and serves the app. The deployed app should show a placeholder page confirming the stack is working. Include a docker-compose or instructions for running behind Caddy with basicauth.

End-to-end: user visits the URL, gets prompted for PIN by Caddy, sees a page with the app title and the three-section layout skeleton (exercise area, answer area, fretboard area -- can be empty placeholder divs with labels).

## Acceptance criteria

- [ ] SvelteKit project initialised with TypeScript
- [ ] Tone.js added as a dependency
- [ ] Dockerfile builds and serves the SvelteKit app in production mode
- [ ] App renders a placeholder page with the three-section layout skeleton (exercise area, answer grid, fretboard)
- [ ] docker-compose.yml or deployment notes for running behind Caddy with basicauth
- [ ] App is desktop-only -- no responsive/mobile considerations

## Blocked by

None -- can start immediately
