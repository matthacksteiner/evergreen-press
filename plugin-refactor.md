# Plugin Refactor Plan

## ✅ Critical Improvements Completed (January 23, 2025)

**Status:** The critical improvements from this plan have been implemented. See
`PLUGIN-IMPROVEMENTS.md` for details.

**What was done:**

- ✅ Added validation utilities (URL validation, path sanitization)
- ✅ Implemented orphaned file cleanup in astro-kirby-sync
- ✅ Implemented orphaned asset cleanup in netlify-hybrid-images
- ✅ Added path sanitization security to plugins
- ✅ Added timing helpers for performance measurement
- ✅ Created smoke test script
- ✅ Tested all changes with successful build

**What was intentionally skipped** (not needed for solo development):

- ❌ Zod schema validation
- ❌ Correlation IDs and structured JSON logging
- ❌ Deep merge for config
- ❌ SHA-256 hashed font filenames
- ❌ Plugin orchestration system
- ❌ Feature flags

---

# Original Plan (For Reference)

## Shared Utilities (`plugins/baukasten-utils/`)

- Replace the shallow spread in `src/config.js` with a deep merge that preserves nested defaults,
  add schema-driven validation (e.g. zod) for each plugin’s `defaultOptions`, and surface friendly
  error messages before hooks run.
- Extend `src/logger.js` to emit structured JSON and attach a per-build correlation ID sourced from
  Netlify `constants` so timing/metrics can roll up across plugins.
- Introduce reusable helpers for high-resolution timing, disk-usage checks, and size/URL
  sanitization so individual plugins stay consistent and changes don’t fragment.

## astro-kirby-sync (`plugins/astro-kirby-sync/`)

- Wrap existing fetch/write paths with the new validation utilities; guard API URLs, language codes,
  and filesystem targets before sync work starts.
- Track file hashes in `.astro/kirby-sync-state.json` and walk `public/content` after each sync to
  delete orphaned content; add translation null/undefined checks before writing JSON to avoid
  malformed payloads.
- Instrument `performFullSync` and incremental sync flows with timing metrics and log them via the
  enhanced logger; add thresholds to warn if sync exceeds expected duration or disk usage.
- Add targeted Vitest coverage for reconciliation and translation edge cases to ensure incremental
  improvements don’t regress the current happy path.

## font-downloader (`plugins/font-downloader/`)

- Validate remote font URLs, allowed protocols, and maximum download size before calling
  `downloadFont`; fail gracefully with actionable messages.
- Generate deterministic filenames using SHA-1/256 hashes of the URL (fallback to original name for
  readability) so collisions are impossible; update manifest writes to reference the hashed names.
- Measure per-font download duration and byte size, emitting roll-up metrics and warnings when retry
  logic engages; ensure temporary files are cleaned up if downloads abort.
- Add tests that exercise hashing, retry backoff, and manifest generation to confirm existing caches
  continue to work.

## netlify-hybrid-images (`plugins/netlify-hybrid-images/`)

- Validate option shapes via the shared helper, including concurrency limits, directory paths, and
  URL prefixes, and short-circuit with clear errors when misconfigured.
- On each run, compare `.netlify/hybrid-images-manifest.json` with files under `public/media`;
  delete orphaned files, purge stale manifest entries, and detect disk usage spikes before build.
- Capture per-asset timing, bytes transferred, and retry counts; aggregate into build-level metrics
  and expose them through structured logs.
- Harden `resolveMediaPath` and download logic with stricter sanitization (no traversal, enforced
  allowed extensions) and integrate new security helpers; expand tests around manifest
  reconciliation and URL rewriting.

## netlify-remote-images (`plugins/netlify-remote-images/`)

- Validate `KIRBY_URL` format, require HTTPS by default, and guard against malformed `netlify.toml`;
  include a dry-run mode for local testing.
- Capture timing for TOML reads/writes and add correlation-aware logs so changes can be traced
  alongside other plugins.
- Add tests ensuring multiple invocations don’t duplicate sections and that invalid configuration
  exits gracefully without touching the file.

## netlify-pretty-urls & lang-folder-rename

- Adopt the shared config validator, structured logging, and timing utilities to keep behavior
  consistent with other plugins.
- Review filesystem mutations for path sanitization and add disk-usage checks when renaming or
  generating folders.
- Backfill lightweight tests (or scripted smoke checks) covering primary path rewrites/renames to
  protect current behavior.

## Plugin Coordination

- Define explicit execution order and dependency notes in each `manifest.yml` (where present) and
  document the intended sequence in `netlify.toml`; ensure `createPluginConfig` can expose
  `options.priority` for future orchestration.
- Centralize plugin enable/disable toggles and fail-fast rules so one misbehaving plugin can opt out
  without breaking the entire build.
- Add a shared health-reporting step that summarizes metrics, warnings, and cleanup actions after
  the build to help catch regressions early.

## Verification & Rollout

- Incrementally land the shared utility upgrades first, update each plugin behind feature flags
  where possible, and run `npm run lint` / `npm run test` after each stage to confirm nothing
  breaks.
- Document new options and operational guidance in each plugin’s README so deploy engineers know how
  to enable metrics, reconciliation, or stricter validation before the changes ship live.

## Testing

- Verify all plugins are working correctly with the new shared utilities.
- Unit tests for each utility function
- Integration tests for plugin coordination
- End-to-end tests with `netlify dev` on localhost:8888 and check the console for errors.
- Performance regression tests
- Security tests for input validation
