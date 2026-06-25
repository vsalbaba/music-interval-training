# 01: Create svelte.config.js with adapter-node

Status: completed

## Description

The project has `@sveltejs/adapter-node` in devDependencies but no
`svelte.config.js`. The build fails without it.

Create a minimal `svelte.config.js` using adapter-node.

## Acceptance

- `npm run build` produces a `build/` directory
