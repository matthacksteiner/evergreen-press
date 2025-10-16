# Netlify Hybrid Images Plugin

Fetch original Kirby media assets during `astro build` and publish them to the local `public/`
directory so Netlify's on-demand image CDN can generate responsive variants at the edge without
relying on origin fetches.

## What it does

1. Reads the cached Kirby JSON content in `public/content/`.
2. Detects media URLs that originate from `${KIRBY_URL}/media/...`.
3. Downloads each original asset into `public/media/…`, skipping already cached files when the
   source is unchanged.
4. (Optional) Rewrites the JSON content to reference the local `/media/...` path instead of the
   Kirby origin.

This hybrid approach deploys the untouched originals alongside the site bundle while still
delegating responsive image generation to Netlify's CDN.

## Usage

Register the integration in `astro.config.mjs`:

```js
import netlifyHybridImages from './plugins/netlify-hybrid-images/index.js';

export default defineConfig({
  integrations: [
    netlifyHybridImages(),
    // …
  ],
});
```

Ensure the `KIRBY_URL` environment variable is available so the plugin can detect valid media URLs.

## Configuration

| Option           | Type            | Default                         | Description                                                                    |
| ---------------- | --------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| `enabled`        | boolean         | `true`                          | Toggles the plugin.                                                            |
| `publicDir`      | string          | `'public'`                      | Root directory where Astro copies static assets.                               |
| `mediaDir`       | string          | `'media'`                       | Sub-directory inside `publicDir` where Kirby assets will be stored.            |
| `concurrency`    | number          | `2`                             | Maximum number of simultaneous downloads.                                      |
| `cacheManifest`  | string \| false | `'hybrid-images-manifest.json'` | File stored in `.netlify/` directory that stores ETag metadata between builds. |
| `skipUnchanged`  | boolean         | `true`                          | Use cached metadata to avoid re-downloading unchanged assets.                  |
| `rewriteContent` | boolean         | `true`                          | Replace Kirby media URLs in `public/content/*.json` with the local variant.    |
| `maxRetries`     | number          | `3`                             | Number of retry attempts for failed downloads.                                 |
| `retryDelay`     | number          | `1000`                          | Base delay between retries in milliseconds (uses exponential backoff).         |
| `timeout`        | number          | `30000`                         | Request timeout in milliseconds (30 seconds).                                  |

### Caching Behaviour

When `cacheManifest` is enabled, the plugin records remote ETags and last-modified headers in
`.netlify/hybrid-images-manifest.json`. Subsequent builds reuse that metadata to send conditional
requests and skip fetching assets that have not changed. Set `skipUnchanged` to `false` or
`cacheManifest` to `false` to force a full re-download on every build.

**Note:** The manifest is stored in the `.netlify/` directory (not in `public/`), which is excluded
from deployments and version control.

### Retry Logic

The plugin automatically retries failed downloads with exponential backoff:

- **Retriable errors**: Socket hang up, connection reset, timeout, rate limiting (429)
- **Non-retriable errors**: 404 Not Found, 403 Forbidden, other 4xx client errors
- **Backoff strategy**: Each retry waits `retryDelay × attempt` milliseconds (e.g., 1s, 2s, 3s)

Disable `rewriteContent` if you only want local copies without touching the cached JSON.

### Cache-Control Headers (Recommended)

For optimal performance, configure Cache-Control headers for your downloaded media assets. This
tells Netlify's CDN how long to cache the source images.

**Option 1: Using `netlify.toml`**

```toml
[[headers]]
  for = "/media/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, must-revalidate"
```

**Option 2: Using `public/_headers`**

```
/media/*
  Cache-Control: public, max-age=604800, must-revalidate
```

This example sets a 7-day cache (`max-age=604800` seconds). Adjust as needed:

- `public` - allows caching by CDN and browsers
- `max-age=604800` - cache for 7 days (604800 seconds)
- `must-revalidate` - requires revalidation when stale

The plugin will provide a helpful tip during builds if no cache headers are detected.

## Netlify Notes

- The plugin runs during `astro build`; the downloaded assets are emitted with the rest of the
  static bundle and served from the Netlify CDN.
- If any download fails, the plugin keeps the Kirby URLs untouched to avoid broken image references.
- Ensure your Kirby CMS domain is configured in `netlify.toml` under `[images] remote_images` for
  fallback scenarios and optimal Netlify Image CDN integration.
