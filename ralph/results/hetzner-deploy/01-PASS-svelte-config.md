# 01: Create svelte.config.js with adapter-node

Result: PASS

## What changed

- Created `svelte.config.js` with `@sveltejs/adapter-node` configuration
- Cleaned up `vite.config.ts` -- removed duplicate adapter import and config that was previously inlined in the `sveltekit()` plugin call

### Key files modified

- `svelte.config.js` (new) -- minimal SvelteKit config with adapter-node
- `vite.config.ts` -- removed adapter-node import and adapter/compilerOptions passed to `sveltekit()`

## Acceptance criteria

- [x] `npm run build` produces a `build/` directory
